// exports all order-related functions: fetchUserOrders, updateOrder, cancelOrder, fetchOrderByNumber, placeOrder

import { db } from "./firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "@react-native-firebase/firestore";
import WhatsAppOrderService from "./whatsAppOrderService";
import {
  estimateDeliveryDate,
  createTrackingUpdate,
} from "./orderTrackingUtils";

// Helper to generate a unique order number
function generateOrderNumber() {
  return "BBM-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

// Fetch orders for a user (last 3 months)
export async function fetchUserOrders(userId) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    where("createdAt", ">=", Timestamp.fromDate(threeMonthsAgo))
  );
  const snap = await getDocs(q);
  let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Debug: If no orders, try fetching all for userId
  if (orders.length === 0) {
    const qAll = query(collection(db, "orders"), where("userId", "==", userId));
    const snapAll = await getDocs(qAll);
    orders = snapAll.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (orders.length > 0) {
      console.warn(
        "Orders found outside 3 months window. Check createdAt field format."
      );
    }
  }

  return orders;
}

// Update order fields
export async function updateOrder(orderId, updates) {
  const ref = doc(db, "orders", orderId);

  // If status is being updated to "delivered", set deliveredAt timestamp
  if (updates.status === "delivered") {
    updates.deliveredAt = Timestamp.now();
  }

  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
}

// Cancel order
export async function cancelOrder(orderId) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status: "cancelled", updatedAt: Timestamp.now() });
}

// Fetch order by orderNumber and email/phone (for guests)
export async function fetchOrderByNumber(orderNumber, emailOrPhone) {
  const q = query(
    collection(db, "orders"),
    where("orderNumber", "==", orderNumber),
    where("userEmail", "==", emailOrPhone) // or use phone if you prefer
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Place order in Firestore with WhatsApp notification
export async function placeOrder(orderData) {
  const orderNumber = generateOrderNumber();

  try {
    // Save order to Firestore
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      orderNumber,
      status: "placed",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Add tracking information
      expectedDeliveryDate: Timestamp.fromDate(
        estimateDeliveryDate(new Date(), "placed")
      ),
      trackingHistory: [createTrackingUpdate(orderNumber, "placed")],
      // Add returns-related fields
      deliveredAt: null, // Will be set when status becomes "delivered"
      hasReturnRequests: false,
      // Ensure items have return tracking fields
      items: orderData.items.map((item) => ({
        ...item,
        quantityReturned: 0,
        returnRequests: [],
        // Add return eligibility from product data
        isReturnable: item.isReturnable !== false, // Default to true unless explicitly false
        returnWindow: item.returnWindow || 7, // Default 7 days return window
      })),
    });

    console.log(
      `✅ Order ${orderNumber} saved to Firestore with ID: ${docRef.id}`
    );

    // Send WhatsApp notification (non-blocking)
    WhatsAppOrderService.sendOrderConfirmation(orderData, orderNumber)
      .then((whatsappResult) => {
        if (whatsappResult.success) {
          console.log(`📱 WhatsApp notification sent for order ${orderNumber}`);

          // Update order with WhatsApp notification status
          updateDoc(doc(db, "orders", docRef.id), {
            whatsappNotification: {
              sent: true,
              sentAt: Timestamp.now(),
              method: whatsappResult.method,
              messageId: whatsappResult.data?.messages?.[0]?.id || null,
            },
          }).catch((updateError) => {
            console.error(
              "Error updating WhatsApp notification status:",
              updateError
            );
          });
        } else {
          console.warn(
            `⚠️ WhatsApp notification failed for order ${orderNumber}:`,
            whatsappResult.reason
          );

          // Update order with failed notification status
          updateDoc(doc(db, "orders", docRef.id), {
            whatsappNotification: {
              sent: false,
              failedAt: Timestamp.now(),
              reason: whatsappResult.reason || "Unknown error",
              error: whatsappResult.error
                ? JSON.stringify(whatsappResult.error)
                : null,
            },
          }).catch((updateError) => {
            console.error(
              "Error updating WhatsApp notification status:",
              updateError
            );
          });
        }
      })
      .catch((whatsappError) => {
        console.error(
          `❌ WhatsApp notification error for order ${orderNumber}:`,
          whatsappError
        );

        // Update order with error status
        updateDoc(doc(db, "orders", docRef.id), {
          whatsappNotification: {
            sent: false,
            failedAt: Timestamp.now(),
            error: whatsappError.message || "Unknown WhatsApp error",
          },
        }).catch((updateError) => {
          console.error(
            "Error updating WhatsApp notification status:",
            updateError
          );
        });
      });

    // Note: Email notifications can be implemented here with backend/Cloud Functions
    // await sendOrderEmail(orderData.userEmail, orderNumber, orderData);
    // await sendOrderEmail("noob.dev.test@gmail.com", orderNumber, orderData);

    return { id: docRef.id, orderNumber };
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
}

// Send order status update with WhatsApp notification
export async function updateOrderStatus(orderId, newStatus, message = "") {
  try {
    // Update order in Firestore
    await updateOrder(orderId, { status: newStatus });

    // Get order details for WhatsApp notification
    const orderDoc = await doc(db, "orders", orderId);
    const orderSnap = await getDocs(
      query(collection(db, "orders"), where("__name__", "==", orderId))
    );

    if (!orderSnap.empty) {
      const orderData = orderSnap.docs[0].data();

      // Send WhatsApp status update if phone number is available
      if (orderData.phone) {
        WhatsAppOrderService.sendOrderStatusUpdate(
          orderData.phone,
          orderData.orderNumber,
          newStatus,
          message
        )
          .then((whatsappResult) => {
            if (whatsappResult.success) {
              console.log(
                `📱 WhatsApp status update sent for order ${orderData.orderNumber}`
              );
            } else {
              console.warn(
                `⚠️ WhatsApp status update failed for order ${orderData.orderNumber}`
              );
            }
          })
          .catch((error) => {
            console.error(
              `❌ WhatsApp status update error for order ${orderData.orderNumber}:`,
              error
            );
          });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// Update order status with tracking history
export async function updateOrderStatusWithTracking(
  orderId,
  newStatus,
  customMessage = null
) {
  try {
    // Get current order to access tracking history
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDocs(
      query(collection(db, "orders"), where("__name__", "==", orderId))
    );

    if (orderSnap.empty) {
      throw new Error("Order not found");
    }

    const orderData = orderSnap.docs[0].data();
    const currentTrackingHistory = orderData.trackingHistory || [];

    // Create new tracking update
    const trackingUpdate = createTrackingUpdate(
      orderData.orderNumber,
      newStatus,
      customMessage
    );

    // Update estimated delivery date if not delivered/cancelled
    let updatedDeliveryDate = orderData.expectedDeliveryDate;
    if (newStatus !== "delivered" && newStatus !== "cancelled") {
      updatedDeliveryDate = Timestamp.fromDate(
        estimateDeliveryDate(orderData.createdAt.toDate(), newStatus)
      );
    }

    // Update order with new status and tracking
    const updateData = {
      status: newStatus,
      updatedAt: Timestamp.now(),
      trackingHistory: [...currentTrackingHistory, trackingUpdate],
    };

    // Add delivery date if not final status
    if (newStatus !== "delivered" && newStatus !== "cancelled") {
      updateData.expectedDeliveryDate = updatedDeliveryDate;
    }

    // If cancelled, add cancellation timestamp
    if (newStatus === "cancelled") {
      updateData.cancelledAt = Timestamp.now();
    }

    // If delivered, add delivery timestamp
    if (newStatus === "delivered") {
      updateData.deliveredAt = Timestamp.now();
    }

    await updateDoc(orderRef, updateData);

    // Send WhatsApp notification
    if (orderData.phone) {
      WhatsAppOrderService.sendOrderStatusUpdate(
        orderData.phone,
        orderData.orderNumber,
        newStatus,
        customMessage || trackingUpdate.message
      )
        .then((whatsappResult) => {
          if (whatsappResult.success) {
            console.log(
              `📱 WhatsApp status update sent for order ${orderData.orderNumber}`
            );
          } else {
            console.warn(
              `⚠️ WhatsApp status update failed for order ${orderData.orderNumber}`
            );
          }
        })
        .catch((error) => {
          console.error(
            `❌ WhatsApp status update error for order ${orderData.orderNumber}:`,
            error
          );
        });
    }

    return { success: true, trackingUpdate };
  } catch (error) {
    console.error("Error updating order status with tracking:", error);
    throw error;
  }
}

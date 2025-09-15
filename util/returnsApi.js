// Returns API - Handles all return-related operations for BBM
import { db } from "./firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  Timestamp,
  writeBatch,
} from "@react-native-firebase/firestore";
import { fetchOrderByNumber } from "./ordersApi";
// import { updateDoc,  } from "firebase/firestore";

/**
 * Return request statuses
 */
export const RETURN_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

/**
 * Return reason categories
 */
export const RETURN_REASONS = {
  DEFECTIVE: "Defective",
  WRONG_ITEM: "Wrong Item",
  DAMAGED_SHIPPING: "Damaged Shipping",
  SIZE_ISSUE: "Size Issue",
  COLOR_MISMATCH: "Color Mismatch",
  QUALITY_ISSUE: "Quality Issue",
  NOT_AS_DESCRIBED: "Not as described",
  CHANGED_MIND: "Changed mind",
  OTHER: "Other",
};

/**
 * R  } catch (error) {
    console.warn("Could not create global function:", error.message);
  }ods
 */
export const REFUND_METHODS = {
  ORIGINAL_PAYMENT: "original_payment",
  BBM_BUCKS: "bbm_bucks",
  BANK_TRANSFER: "bank_transfer",
};

/**
 * Check if an order is eligible for returns
 */
export async function checkReturnEligibility(orderId) {
  try {
    console.log("Checking return eligibility for order:", orderId);
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) {
      console.log("Order not found:", orderId);
      return { eligible: false, reason: "Order not found" };
    }

    const order = orderDoc.data();
    console.log("Order data:", {
      status: order.status,
      hasDeliveredAt: !!order.deliveredAt,
      itemsCount: order.items?.length || 0,
    });

    // Check if order is delivered
    if (order.status !== "delivered") {
      return {
        eligible: false,
        reason: "Orders can only be returned after delivery",
      };
    }

    // FRAUD PREVENTION: Check for existing return requests
    console.log("🔍 Fetching return requests for order:", orderId);
    const returnsQuery = query(
      collection(db, "return_requests"),
      where("orderId", "==", orderId)
    );
    const returnsSnapshot = await getDocs(returnsQuery);
    const existingReturns = returnsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `✅ Found ${existingReturns.length} return requests for order ${orderId}`
    );

    // If there are existing return requests, prevent new ones
    if (existingReturns.length > 0) {
      const pendingReturns = existingReturns.filter(
        (ret) =>
          ret.status === "pending" ||
          ret.status === "approved" ||
          ret.status === "processing"
      );

      if (pendingReturns.length > 0) {
        return {
          eligible: false,
          reason: "A return request is already pending for this order",
          existingReturns: pendingReturns,
        };
      }

      // Check if all items have been returned already
      const completedReturns = existingReturns.filter(
        (ret) => ret.status === "completed" || ret.status === "refunded"
      );

      if (completedReturns.length > 0) {
        // Calculate total items already returned
        const totalItemsReturned = completedReturns.reduce((total, ret) => {
          return (
            total +
            (ret.items?.reduce(
              (itemTotal, item) => itemTotal + item.quantity,
              0
            ) || 0)
          );
        }, 0);

        const totalOrderItems =
          order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

        if (totalItemsReturned >= totalOrderItems) {
          return {
            eligible: false,
            reason: "All items from this order have already been returned",
            existingReturns: completedReturns,
          };
        }
      }
    }

    // Check if order has deliveredAt timestamp
    // For testing: if deliveredAt is missing but status is delivered, assume it was delivered recently
    let deliveredDate;
    if (order.deliveredAt) {
      deliveredDate = order.deliveredAt.toDate();
    } else if (order.status === "delivered") {
      // Fallback: assume delivered recently for testing
      console.warn(
        "Order marked as delivered but no deliveredAt timestamp. Using current date for testing."
      );
      deliveredDate = new Date();
    } else {
      return {
        eligible: false,
        reason: "Delivery date not available",
      };
    }

    const now = new Date();

    // Check each item's return eligibility
    const eligibleItems = [];
    const ineligibleItems = [];

    for (const item of order.items) {
      const itemEligibility = await checkItemReturnEligibility(
        item,
        deliveredDate,
        now
      );

      if (itemEligibility.eligible) {
        eligibleItems.push({
          ...item,
          remainingDays: itemEligibility.remainingDays,
          maxReturnableQuantity: itemEligibility.maxReturnableQuantity,
        });
      } else {
        ineligibleItems.push({
          ...item,
          reason: itemEligibility.reason,
        });
      }
    }

    const result = {
      eligible: eligibleItems.length > 0,
      eligibleItems,
      ineligibleItems,
      orderDeliveredAt: deliveredDate,
    };

    console.log("Return eligibility result:", {
      orderId,
      eligible: result.eligible,
      eligibleItemsCount: eligibleItems.length,
      ineligibleItemsCount: ineligibleItems.length,
    });

    return result;
  } catch (error) {
    console.error("Error checking return eligibility:", error);
    return { eligible: false, reason: "Error checking eligibility" };
  }
}

/**
 * Check individual item return eligibility
 */
async function checkItemReturnEligibility(item, deliveredDate, currentDate) {
  try {
    // Check if item is inherently returnable (default to true if not specified)
    if (item.isReturnable === false) {
      return {
        eligible: false,
        reason: "Item is not returnable",
      };
    }

    // Get return window (default 7 days if not specified)
    // For testing purposes, be generous with return windows
    const returnWindow = item.returnWindow || 7;

    // Calculate days since delivery
    const daysSinceDelivery = Math.floor(
      (currentDate - deliveredDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > returnWindow) {
      return {
        eligible: false,
        reason: `Return window expired (${returnWindow} days)`,
      };
    }

    // Check how many units have already been returned
    const alreadyReturned = item.quantityReturned || 0;
    const maxReturnableQuantity = item.quantity - alreadyReturned;

    if (maxReturnableQuantity <= 0) {
      return {
        eligible: false,
        reason: "All units already returned",
      };
    }

    return {
      eligible: true,
      remainingDays: returnWindow - daysSinceDelivery,
      maxReturnableQuantity,
    };
  } catch (error) {
    console.error("Error checking item eligibility:", error);
    return {
      eligible: false,
      reason: "Error checking item eligibility",
    };
  }
}

/**
 * Calculate refund amount for items considering discounts/coupons
 */
export function calculateRefundAmount(items, order) {
  let totalRefund = 0;

  // If order had a coupon applied, we need to prorate the discount
  const orderHadCoupon =
    order.appliedCoupon && order.appliedCoupon.discountAmount > 0;
  const couponDiscountAmount = orderHadCoupon
    ? order.appliedCoupon.discountAmount
    : 0;

  // Calculate original subtotal and return subtotal
  let originalSubtotal = 0;
  let returnSubtotal = 0;

  // First pass: calculate totals (including tax)
  for (const orderItem of order.items) {
    const itemPrice = orderItem.price * orderItem.quantity;
    const taxRate = orderItem.taxRate || order.taxRate || 0.18;
    const itemTax = itemPrice * taxRate;
    originalSubtotal += itemPrice + itemTax;
  }

  // Second pass: calculate refunds for returned items (including tax)
  for (const returnItem of items) {
    const orderItem = order.items.find((item) => item.id === returnItem.itemId);
    if (!orderItem) continue;

    // Calculate item refund including tax
    const itemPrice = orderItem.price * returnItem.quantity;

    // Calculate tax for this item (assuming 18% GST if not specified)
    const taxRate = orderItem.taxRate || order.taxRate || 0.18;
    const itemTax = itemPrice * taxRate;

    const itemRefund = itemPrice + itemTax;
    returnSubtotal += itemRefund;
  }

  // Calculate prorated coupon discount for returned items
  let proratedCouponDiscount = 0;
  if (orderHadCoupon && originalSubtotal > 0) {
    proratedCouponDiscount =
      (couponDiscountAmount * returnSubtotal) / originalSubtotal;
  }

  // Final refund = item total - prorated coupon discount
  totalRefund = returnSubtotal - proratedCouponDiscount;

  // Handle BBM Bucks redemption prorating
  let proratedBBMBucksDiscount = 0;
  if (
    order.bbmBucksDiscount &&
    order.bbmBucksDiscount > 0 &&
    originalSubtotal > 0
  ) {
    proratedBBMBucksDiscount =
      (order.bbmBucksDiscount * returnSubtotal) / originalSubtotal;
    totalRefund -= proratedBBMBucksDiscount;
  }

  return {
    totalRefund: Math.max(0, totalRefund),
    breakdown: {
      itemsSubtotal: returnSubtotal,
      couponDiscount: proratedCouponDiscount,
      bbmBucksDiscount: proratedBBMBucksDiscount,
    },
  };
}

/**
 * Submit a return request
 */
export async function submitReturnRequest(returnData) {
  const batch = writeBatch(db);

  try {
    // Generate return request number
    const returnNumber = generateReturnNumber();

    // Create return request document
    const returnRequestRef = doc(collection(db, "return_requests"));
    const returnRequest = {
      returnNumber,
      orderId: returnData.orderId,
      userId: returnData.userId,
      items: returnData.items,
      reason: returnData.reason,
      customReason: returnData.customReason || null,
      refundMethod: returnData.refundMethod,
      refundAmount: returnData.refundAmount,
      refundBreakdown: returnData.refundBreakdown,
      status: RETURN_STATUSES.PENDING,
      submittedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      estimatedProcessingDays: 5, // 3-5 days as mentioned
      customerNotes: returnData.customerNotes || null,
      images: returnData.images || [],
      // Admin fields
      adminNotes: null,
      processedBy: null,
      processedAt: null,
      refundedAt: null,
      refundTransactionId: null,
    };

    batch.set(returnRequestRef, returnRequest);

    // Update order items with returned quantities
    const orderRef = doc(db, "orders", returnData.orderId);
    const orderDoc = await getDoc(orderRef);

    if (orderDoc.exists()) {
      const order = orderDoc.data();
      const updatedItems = order.items.map((item) => {
        const returnItem = returnData.items.find((ri) => ri.itemId === item.id);
        if (returnItem) {
          return {
            ...item,
            quantityReturned:
              (item.quantityReturned || 0) + returnItem.quantity,
            returnRequests: [
              ...(item.returnRequests || []),
              {
                returnNumber,
                quantity: returnItem.quantity,
                status: RETURN_STATUSES.PENDING,
                submittedAt: Timestamp.now(),
              },
            ],
          };
        }
        return item;
      });

      batch.update(orderRef, {
        items: updatedItems,
        hasReturnRequests: true,
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();

    return {
      success: true,
      returnNumber,
      returnRequestId: returnRequestRef.id,
    };
  } catch (error) {
    console.error("Error submitting return request:", error);
    throw error;
  }
}

/**
 * Fetch user's return requests
 */
export async function fetchUserReturnRequests(userId) {
  try {
    const q = query(
      collection(db, "return_requests"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by submission date (newest first)
    return requests.sort(
      (a, b) => b.submittedAt.seconds - a.submittedAt.seconds
    );
  } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
  }
}

/**
 * Get return request by return number
 */
export async function fetchReturnRequestByNumber(returnNumber) {
  try {
    const q = query(
      collection(db, "return_requests"),
      where("returnNumber", "==", returnNumber)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error("Error fetching return request:", error);
    throw error;
  }
}

/**
 * Update return request status (admin function)
 */
export async function updateReturnRequestStatus(
  returnRequestId,
  newStatus,
  adminNotes = null
) {
  try {
    // Get return request details first
    const returnDoc = await getDoc(doc(db, "return_requests", returnRequestId));
    if (!returnDoc.exists()) {
      throw new Error("Return request not found");
    }

    const returnData = returnDoc.data();
    console.log(`📋 Return data for ${returnData.returnNumber}:`, {
      userId: returnData.userId,
      orderId: returnData.orderId,
      refundMethod: returnData.refundMethod,
      refundAmount: returnData.refundAmount,
      status: returnData.status,
    });
    const updates = {
      status: newStatus,
      updatedAt: Timestamp.now(),
    };

    if (adminNotes) {
      updates.adminNotes = adminNotes;
    }

    if (newStatus === RETURN_STATUSES.APPROVED) {
      updates.approvedAt = Timestamp.now();
    } else if (newStatus === RETURN_STATUSES.REFUNDED) {
      updates.refundedAt = Timestamp.now();
    }

    await updateDoc(doc(db, "return_requests", returnRequestId), updates);

    return { success: true };
  } catch (error) {
    console.error("Error updating return request status:", error);
    throw error;
  }
}

/**
 * Cancel a return request (user-initiated)
 * Only allows cancellation if return is still pending
 */
export async function cancelReturnRequest(returnRequestId, userId) {
  try {
    console.log(`🔄 Cancelling return request: ${returnRequestId}`);

    // Get the return request to validate ownership and status
    const returnDoc = await getDoc(doc(db, "return_requests", returnRequestId));

    if (!returnDoc.exists()) {
      throw new Error("Return request not found");
    }

    const returnData = returnDoc.data();

    // Validate ownership
    if (returnData.userId !== userId) {
      throw new Error("Unauthorized: You can only cancel your own returns");
    }

    // Only allow cancellation if status is pending
    if (returnData.status !== RETURN_STATUSES.PENDING) {
      throw new Error(
        `Cannot cancel return with status: ${returnData.status}. Only pending returns can be cancelled.`
      );
    }

    // Update return request status to cancelled
    const updates = {
      status: RETURN_STATUSES.CANCELLED,
      cancelledAt: Timestamp.now(),
      cancelledBy: "user",
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, "return_requests", returnRequestId), updates);

    console.log(
      `✅ Return request ${returnData.returnNumber} cancelled successfully`
    );

    return {
      success: true,
      returnNumber: returnData.returnNumber,
      message: "Return request cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling return request:", error);
    throw error;
  }
}

/**
 * Generate unique return number
 */
function generateReturnNumber() {
  return "RET-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

/**
 * Get return statistics for user (optional dashboard feature)
 */
export async function getUserReturnStats(userId) {
  try {
    const q = query(
      collection(db, "return_requests"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map((doc) => doc.data());

    const stats = {
      totalReturns: requests.length,
      pendingReturns: requests.filter(
        (r) => r.status === RETURN_STATUSES.PENDING
      ).length,
      approvedReturns: requests.filter(
        (r) => r.status === RETURN_STATUSES.APPROVED
      ).length,
      completedReturns: requests.filter(
        (r) => r.status === RETURN_STATUSES.COMPLETED
      ).length,
      totalRefundAmount: requests
        .filter((r) => r.status === RETURN_STATUSES.REFUNDED)
        .reduce((sum, r) => sum + (r.actualRefundAmount || r.refundAmount), 0),
    };

    return stats;
  } catch (error) {
    console.error("Error fetching return stats:", error);
    return null;
  }
}

/**
 * Get return details by return number
 * @param {string} returnNumber - The return request number
 * @returns {Promise<Object|null>} Return request details
 */
export async function getReturnDetails(returnNumber) {
  try {
    console.log("🔍 Fetching return details for:", returnNumber);

    const returnsRef = collection(db, "return_requests");
    const q = query(returnsRef, where("returnNumber", "==", returnNumber));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ No return found with number:", returnNumber);
      return null;
    }

    const returnDoc = querySnapshot.docs[0];
    const returnData = { id: returnDoc.id, ...returnDoc.data() };

    // Convert timestamps if they exist
    if (returnData.createdAt) {
      returnData.createdAt = returnData.createdAt.toDate();
    }
    if (returnData.updatedAt) {
      returnData.updatedAt = returnData.updatedAt.toDate();
    }

    // Convert status history timestamps
    if (returnData.statusHistory && Array.isArray(returnData.statusHistory)) {
      returnData.statusHistory = returnData.statusHistory.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp?.toDate
          ? entry.timestamp.toDate()
          : entry.timestamp,
      }));
    }

    console.log("✅ Return details fetched successfully:", {
      id: returnData.id,
      returnNumber: returnData.returnNumber,
      status: returnData.status,
      itemsCount: returnData.items?.length || 0,
    });

    return returnData;
  } catch (error) {
    console.error("❌ Error fetching return details:", error);
    throw error;
  }
}

/**
 * Get all return requests for a specific order
 * @param {string} orderId - The order ID
 * @returns {Promise<Array>} Array of return requests
 */
export async function getReturnRequestsForOrder(orderId) {
  try {
    console.log("🔍 Fetching return requests for order:", orderId);

    const returnsRef = collection(db, "return_requests");
    const q = query(returnsRef, where("orderId", "==", orderId));

    const querySnapshot = await getDocs(q);

    const returnRequests = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert timestamps
      if (data.submittedAt) {
        data.submittedAt = data.submittedAt.toDate();
      }
      if (data.updatedAt) {
        data.updatedAt = data.updatedAt.toDate();
      }
      if (data.processedAt) {
        data.processedAt = data.processedAt.toDate();
      }
      if (data.refundedAt) {
        data.refundedAt = data.refundedAt.toDate();
      }

      returnRequests.push({
        id: doc.id,
        ...data,
      });
    });

    // Sort by submission date (newest first)
    returnRequests.sort((a, b) => b.submittedAt - a.submittedAt);

    console.log(
      `✅ Found ${returnRequests.length} return requests for order ${orderId}`
    );
    return returnRequests;
  } catch (error) {
    console.error("❌ Error fetching return requests for order:", error);
    throw error;
  }
}

/**
 * Admin function to update return status by return number
 * Use this function instead of manually updating status in Firebase console
 */
export async function updateReturnStatusByNumber(
  returnNumber,
  newStatus,
  adminNotes = null
) {
  try {
    console.log(`🔧 Admin updating return ${returnNumber} to ${newStatus}`);

    // Find return by number
    const returnsQuery = query(
      collection(db, "return_requests"),
      where("returnNumber", "==", returnNumber)
    );

    const querySnapshot = await getDocs(returnsQuery);
    if (querySnapshot.empty) {
      throw new Error(`Return ${returnNumber} not found`);
    }

    const returnDoc = querySnapshot.docs[0];
    const returnId = returnDoc.id;

    // Update status using the proper function that handles refund processing
    await updateReturnRequestStatus(returnId, newStatus, adminNotes);

    console.log(
      `✅ Successfully updated return ${returnNumber} to ${newStatus}`
    );

    return { success: true, returnId };
  } catch (error) {
    console.error(`❌ Error updating return status:`, error);
    throw error;
  }
}

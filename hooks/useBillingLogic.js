import { useState, useContext } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { CartContext } from "../store/cart-context";
import { AuthContext } from "../store/auth-context";
import { AddressContext } from "../store/address-context";
import { UserContext } from "../store/user-context";
import { BBMBucksContext } from "../store/bbm-bucks-context";
import { placeOrder } from "../util/ordersApi";
import { validateAndApplyCoupon, recordCouponUsage } from "../util/couponUtils";
import BBMBucksService from "../util/bbmBucksService";
import { useToast } from "../components/UI/ToastProvider";
import {
  PAYMENT_METHODS,
  PaymentService,
  PAYMENT_STATUS,
} from "../util/paymentService";
import { EmailService, EmailTemplates } from "../components/Email";

export function useBillingLogic() {
  const navigation = useNavigation();
  const { showToast } = useToast();

  const cartCtx = useContext(CartContext);
  const authCtx = useContext(AuthContext);
  const addressCtx = useContext(AddressContext);
  const userCtx = useContext(UserContext);
  const bbmBucksCtx = useContext(BBMBucksContext);

  // Local state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [addressSelectorVisible, setAddressSelectorVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    PAYMENT_METHODS.COD
  );
  const [orderDataForPayment, setOrderDataForPayment] = useState(null);
  const [guestData, setGuestData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
    },
    deliveryInstructions: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponValidating, setIsCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  // BBM Bucks state
  const [bbmBucksRedemption, setBBMBucksRedemption] = useState(0);
  const [bbmBucksDiscount, setBBMBucksDiscount] = useState(0);

  // GSTIN state
  const [gstinNumber, setGstinNumber] = useState(null);

  // Calculate billing details
  const subtotal = cartCtx.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate discount based on coupon type
  const discount = appliedCoupon ? appliedCoupon.discountAmount || 0 : 0;
  const standardShipping = 50;
  const shipping =
    appliedCoupon?.discountType === "free_shipping" ? 0 : standardShipping;

  // For free shipping coupons, the discount amount represents shipping savings
  const actualDiscount =
    appliedCoupon?.discountType === "free_shipping" ? 0 : discount;

  // Calculate total discount including BBM Bucks
  const totalDiscountAmount = actualDiscount + bbmBucksDiscount;

  const tax = +((subtotal - totalDiscountAmount) * 0.18).toFixed(2);
  const total = +(subtotal - totalDiscountAmount + tax + shipping).toFixed(2);

  // Get default address
  const defaultAddress = addressCtx.addresses?.find(
    (a) => a.id === addressCtx.defaultAddressId
  );

  const clearGuestData = () => {
    setGuestData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const showOrderSuccessAlert = (
    orderNumber,
    isGuest = false,
    emailSent = false
  ) => {
    const emailMessage = emailSent
      ? "\n\nA confirmation email has been sent with order details."
      : "";

    const message = isGuest
      ? `Your order #${orderNumber} has been placed.${emailMessage}\n\nPlease save your order number for tracking.`
      : `Your order #${orderNumber} has been placed.${emailMessage}\n\nWould you like to track your order?`;

    const buttons = isGuest
      ? [
          {
            text: "Continue Shopping",
            onPress: () => navigation.navigate("HomeScreen"),
          },
        ]
      : [
          {
            text: "Continue Shopping",
            style: "cancel",
            onPress: () => navigation.navigate("HomeScreen"),
          },
          {
            text: "Track Order",
            onPress: () =>
              navigation.navigate("UserScreen", {
                screen: "OrdersScreen",
                params: { highlightOrder: orderNumber, refresh: Date.now() },
              }),
          },
        ];

    Alert.alert("Order Placed Successfully! 🎉", message, buttons);
  };

  // Send order confirmation email
  const sendOrderConfirmationEmail = async (orderData, orderNumber) => {
    try {
      // Determine recipient email
      let customerEmail = null;
      let customerName = null;

      if (authCtx.isAuthenticated) {
        // For authenticated users, get from auth context and user context
        customerEmail = userCtx.user?.email || authCtx.userEmail;
        customerName =
          userCtx.user?.name || authCtx.userName || "Valued Customer";
      } else if (orderData.guest && guestData.email) {
        // For guest users, get from guest data
        customerEmail = guestData.email;
        customerName = guestData.name || "Guest Customer";
      }

      if (!customerEmail) {
        console.warn("⚠️ No customer email found for order confirmation");
        return { success: false, error: "No customer email" };
      }

      // Format order items for email
      const orderItems = cartCtx.items.map((item) => ({
        name: item.productName || item.title || "Product",
        quantity: item.quantity,
        size: item.sizes || item.size || "Standard",
        price: `${item.price * item.quantity}`,
      }));

      // Format delivery address
      let deliveryAddress = "Not specified";
      if (authCtx.isAuthenticated) {
        const addressToUse = selectedAddress || defaultAddress;
        if (addressToUse) {
          deliveryAddress = `${addressToUse.line1}, ${
            addressToUse.line2 ? addressToUse.line2 + ", " : ""
          }${addressToUse.city}, ${addressToUse.state} - ${addressToUse.zip}`;
        }
      } else if (orderData.guest && guestData.address) {
        const addr = guestData.address;
        deliveryAddress = `${addr.line1}, ${
          addr.line2 ? addr.line2 + ", " : ""
        }${addr.city}, ${addr.state} - ${addr.zip}`;
      }

      const emailOrderData = {
        orderNum: orderNumber,
        customerName,
        customerEmail,
        orderItems,
        orderTotal: total.toString(),
        deliveryAddress,
        estimatedDelivery: "3-5 business days",
        paymentMethod:
          selectedPaymentMethod === PAYMENT_METHODS.COD
            ? "Cash on Delivery"
            : "Online Payment",
      };

      const emailData = {
        to: [customerEmail],
        message: {
          subject: `Order Confirmation - ${orderNumber} | Build Bharat Mart`,
          html: EmailTemplates.orderConfirmationTemplate(emailOrderData),
          text: `Order confirmation for ${orderNumber}. Total: ₹${total}. Thank you for your order!`,
        },
        template: {
          type: "order_confirmation",
          version: "1.0",
          data: emailOrderData,
        },
        metadata: {
          userId: authCtx.userId || "guest",
          emailType: "order_confirmation",
          orderNum: orderNumber,
          orderTotal: total.toString(),
          customerType: authCtx.isAuthenticated ? "registered" : "guest",
        },
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log(
          `✅ Order confirmation email sent for order ${orderNumber} to ${customerEmail}`
        );
      } else {
        console.error(`❌ Failed to send order confirmation: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Order confirmation email error:", error);
      return { success: false, error: error.message };
    }
  };

  // Payment handlers
  const handlePaymentSuccess = async (paymentResult, orderData) => {
    try {
      // Update order data with payment information
      const updatedOrderData = {
        ...orderData,
        paymentMethod: paymentResult.paymentMethod,
        paymentId: paymentResult.paymentId,
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        paidAmount: paymentResult.amount,
        bbmBucksRedeemed: bbmBucksRedemption,
        bbmBucksDiscount: bbmBucksDiscount,
      };

      const { orderNumber } = await placeOrder(updatedOrderData);

      // Record coupon usage if applied
      if (appliedCoupon) {
        await recordCouponUsage(
          appliedCoupon.id,
          orderData.userId,
          orderNumber
        );
      }

      // Process BBM Bucks operations if authenticated
      if (authCtx.isAuthenticated && authCtx.userId) {
        try {
          // Redeem BBM Bucks if applicable
          if (bbmBucksRedemption > 0) {
            await BBMBucksService.redeemBBMBucks(
              authCtx.userId,
              bbmBucksRedemption,
              orderNumber
            );
          }

          // Award BBM Bucks for this purchase
          const orderAmount = updatedOrderData.total || total;
          const productCategories = cartCtx.items
            .map((item) => item.category)
            .filter(Boolean);

          const bbmBucksReward = await BBMBucksService.awardBBMBucks(
            authCtx.userId,
            orderNumber,
            orderAmount,
            productCategories
          );

          // Update order with earned BBM Bucks amount
          if (bbmBucksReward && bbmBucksReward.bbmBucks > 0) {
            // You might want to update the order document with this information
            // For now, we'll handle it in the OrderDetailsScreen by calculating it
          }

          // Refresh BBM Bucks balance
          await bbmBucksCtx.refreshBalance();
        } catch (bbmBucksError) {
          console.error("BBM Bucks processing error:", bbmBucksError);
          // Don't fail the order for BBM Bucks errors
        }
      }

      // Clear cart and reset state
      cartCtx.clearCart();
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
      setBBMBucksRedemption(0);
      setBBMBucksDiscount(0);
      setSelectedPaymentMethod(PAYMENT_METHODS.COD);

      showToast(
        `🎉 Payment successful! Order #${orderNumber} placed!`,
        "success",
        4000
      );

      // Send order confirmation email
      const emailResult = await sendOrderConfirmationEmail(
        orderData,
        orderNumber
      );

      // Navigate back to cart main screen
      navigation.reset({
        index: 0,
        routes: [{ name: "CartMain" }],
      });

      setTimeout(() => {
        showOrderSuccessAlert(
          orderNumber,
          orderData.guest,
          emailResult.success
        );
      }, 1000);
    } catch (error) {
      console.error("Order creation after payment error:", error);
      showToast(
        "Payment successful but order creation failed. Contact support.",
        "error"
      );

      Alert.alert(
        "Payment Successful",
        `Your payment was processed successfully (Payment ID: ${paymentResult.paymentId}), but there was an issue creating your order. Please contact customer support with this payment ID.`,
        [{ text: "OK" }]
      );
    }
  };

  const handlePaymentFailure = (paymentResult) => {
    console.log("Payment failed:", paymentResult);

    if (paymentResult.cancelled) {
      showToast("Payment was cancelled", "info");
    } else {
      showToast(`Payment failed: ${paymentResult.error}`, "error");
    }
  };

  const processPayment = async (orderData) => {
    if (selectedPaymentMethod === PAYMENT_METHODS.RAZORPAY) {
      // For Razorpay, we'll handle the payment in the component
      // This function prepares the data
      return {
        requiresPayment: true,
        paymentData: {
          amount: total,
          orderId: PaymentService.generateOrderId(),
          userInfo: {
            name: orderData.guest
              ? orderData.userEmail.split("@")[0]
              : userCtx.user?.name || "Customer",
            email: orderData.userEmail,
            contact: orderData.phone || "9999999999",
          },
        },
        orderData,
      };
    } else {
      // Cash on Delivery - process order directly
      const { orderNumber } = await placeOrder({
        ...orderData,
        paymentMethod: PAYMENT_METHODS.COD,
        paymentStatus: PAYMENT_STATUS.PENDING,
      });

      // Record coupon usage if applied
      if (appliedCoupon) {
        await recordCouponUsage(
          appliedCoupon.id,
          orderData.userId,
          orderNumber
        );
      }

      return {
        requiresPayment: false,
        orderNumber,
      };
    }
  };

  // Coupon functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsCouponValidating(true);
    setCouponError("");

    try {
      const orderData = {
        items: cartCtx.items,
        subtotal,
      };

      // console.log("🛒 Cart items for coupon validation:", cartCtx.items);
      // console.log("💰 Subtotal:", subtotal);
      // console.log("👤 User ID:", authCtx.userId);

      const result = await validateAndApplyCoupon(
        couponCode,
        orderData,
        authCtx.userId
      );

      if (result.isValid) {
        // Include the discountAmount in the coupon object
        const couponWithDiscount = {
          ...result.coupon,
          discountAmount: result.discountAmount,
        };
        setAppliedCoupon(couponWithDiscount);
        setCouponCode("");
        showToast(
          `Coupon applied! You saved ₹${result.discountAmount.toFixed(2)}`,
          "success"
        );
      } else {
        setCouponError(result.error);
      }
    } catch (error) {
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    showToast("Coupon removed", "info");
  };

  // BBM Bucks handlers
  const handleBBMBucksRedeem = async (redeemAmount) => {
    try {
      if (!authCtx.isAuthenticated) {
        showToast("Please login to use BBM Bucks", "error");
        return;
      }

      // Calculate discount value (10 BBM Bucks = ₹1)
      const discountValue = redeemAmount / BBMBucksService.CONVERSION_RATE;

      setBBMBucksRedemption(redeemAmount);
      setBBMBucksDiscount(discountValue);

      showToast(
        `Applied ${redeemAmount} BBM Bucks (₹${discountValue.toFixed(
          2
        )} discount)`,
        "success"
      );
    } catch (error) {
      console.error("❌ Error applying BBM Bucks:", error);
      showToast("Failed to apply BBM Bucks discount", "error");
    }
  };

  const handleBBMBucksRemove = () => {
    setBBMBucksRedemption(0);
    setBBMBucksDiscount(0);
    showToast("BBM Bucks discount removed", "info");
  };

  // Direct payment handler for Razorpay
  const handleDirectPayment = async () => {
    if (cartCtx.items.length === 0) {
      Alert.alert("Cart is empty");
      return;
    }

    // First prepare the order data like in handlePlaceOrder
    if (authCtx.isAuthenticated) {
      const user = userCtx.user || {};
      if (!authCtx.userId) {
        Alert.alert("Error", "User ID missing. Please log in again.");
        return;
      }
      if (!user.email) {
        Alert.alert("Error", "User email missing. Please update your profile.");
        return;
      }

      const addressToUse = selectedAddress || defaultAddress;
      if (!addressToUse) {
        Alert.alert("No address", "Please add/select a delivery address.", [
          {
            text: "Add Address",
            onPress: () => setAddressSelectorVisible(true),
          },
          { text: "Cancel", style: "cancel" },
        ]);
        return;
      }

      setIsPlacingOrder(true);

      try {
        const orderData = {
          userId: authCtx.userId,
          userEmail: user.email,
          items: cartCtx.items,
          address: addressToUse,
          phone: user.phone || "",
          total,
          subtotal,
          discount,
          appliedCoupon: appliedCoupon
            ? {
                id: appliedCoupon.id,
                code: appliedCoupon.code,
                discountAmount: appliedCoupon.discountAmount,
              }
            : null,
          guest: false,
        };

        // Directly trigger Razorpay payment
        const paymentData = {
          amount: total,
          orderId: PaymentService.generateOrderId(),
          userInfo: {
            name: user.name || "Customer",
            email: user.email,
            contact: user.phone || "9999999999",
          },
        };

        console.log("🎯 Starting direct payment process...");
        const paymentResult = await PaymentService.processRazorpayPayment(
          paymentData
        );

        if (paymentResult.success) {
          // Process successful payment
          await handlePaymentSuccess(
            {
              paymentId: paymentResult.paymentId,
              orderId: paymentData.orderId, // Use our generated order ID
              signature: paymentResult.signature,
              amount: total,
              paymentMethod: "razorpay",
            },
            orderData
          );
        } else {
          handlePaymentFailure(paymentResult);
        }
      } catch (error) {
        console.error("Direct payment error:", error);
        showToast("Payment failed. Please try again.", "error");
      }

      setIsPlacingOrder(false);
    } else {
      setGuestModalVisible(true);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartCtx.items.length === 0) {
      Alert.alert("Cart is empty");
      return;
    }

    if (authCtx.isAuthenticated) {
      const user = userCtx.user || {};
      if (!authCtx.userId) {
        Alert.alert("Error", "User ID missing. Please log in again.");
        return;
      }
      if (!user.email) {
        Alert.alert("Error", "User email missing. Please update your profile.");
        return;
      }

      const addressToUse = selectedAddress || defaultAddress;

      if (!addressToUse) {
        Alert.alert("No address", "Please add/select a delivery address.", [
          {
            text: "Add Address",
            onPress: () => setAddressSelectorVisible(true),
          },
          { text: "Cancel", style: "cancel" },
        ]);
        return;
      }

      setIsPlacingOrder(true);
      try {
        const orderData = {
          userId: authCtx.userId,
          userEmail: user.email,
          userName: user.name || user.displayName || null, // Add user's name from profile
          items: cartCtx.items,
          address: addressToUse,
          phone: user.phone || "",
          total,
          subtotal,
          discount,
          appliedCoupon: appliedCoupon
            ? {
                id: appliedCoupon.id,
                code: appliedCoupon.code,
                discountAmount: appliedCoupon.discountAmount,
              }
            : null,
          bbmBucksRedeemed: bbmBucksRedemption,
          bbmBucksDiscount: bbmBucksDiscount,
          gstinNumber: gstinNumber,
          guest: false,
        };

        const paymentResult = await processPayment(orderData);

        if (paymentResult.requiresPayment) {
          // Store the order data and payment data for later use
          setOrderDataForPayment({
            orderData: paymentResult.orderData,
            paymentData: paymentResult.paymentData,
          });
          // The payment will be handled by the Razorpay component
          // We don't clear the cart or navigate here
        } else {
          // COD order placed successfully - Process BBM Bucks
          try {
            // Process BBM Bucks operations if authenticated
            if (authCtx.isAuthenticated && authCtx.userId) {
              // Redeem BBM Bucks if applicable
              if (bbmBucksRedemption > 0) {
                await BBMBucksService.redeemBBMBucks(
                  authCtx.userId,
                  bbmBucksRedemption,
                  paymentResult.orderNumber
                );
              }

              // Award BBM Bucks for this purchase
              const productCategories = cartCtx.items
                .map((item) => item.category)
                .filter(Boolean);

              await BBMBucksService.awardBBMBucks(
                authCtx.userId,
                paymentResult.orderNumber,
                total,
                productCategories
              );

              // Refresh BBM Bucks balance
              await bbmBucksCtx.refreshBalance();
            }
          } catch (bbmBucksError) {
            console.error("BBM Bucks processing error (COD):", bbmBucksError);
            // Don't fail the order for BBM Bucks errors
          }

          cartCtx.clearCart();
          setAppliedCoupon(null);
          setCouponCode("");
          setCouponError("");
          setBBMBucksRedemption(0);
          setBBMBucksDiscount(0);
          setSelectedPaymentMethod(PAYMENT_METHODS.COD);

          showToast(
            `🎉 Order #${paymentResult.orderNumber} placed successfully!`,
            "success",
            4000
          );

          // Send order confirmation email
          const emailResult = await sendOrderConfirmationEmail(
            { userId: authCtx.userId, guest: false },
            paymentResult.orderNumber
          );

          navigation.reset({
            index: 0,
            routes: [{ name: "CartMain" }],
          });

          setTimeout(() => {
            showOrderSuccessAlert(
              paymentResult.orderNumber,
              false,
              emailResult.success
            );
          }, 1000);
        }
      } catch (e) {
        console.log("Order placement error (logged-in):", e);
        showToast("Failed to place order. Please try again.", "error");
      }
      setIsPlacingOrder(false);
    } else {
      setGuestModalVisible(true);
    }
  };

  const handleGuestOrder = async () => {
    const { name, email, phone, address, deliveryInstructions } = guestData;

    if (
      !email ||
      !phone ||
      !name ||
      !address?.line1 ||
      !address?.city ||
      !address?.state ||
      !address?.zip
    ) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        userId: null,
        userEmail: email,
        name: name, // Store guest's name at order level
        items: cartCtx.items,
        address: address, // Use the structured address object
        phone,
        total,
        subtotal,
        discount,
        deliveryInstructions: deliveryInstructions || "",
        appliedCoupon: appliedCoupon
          ? {
              id: appliedCoupon.id,
              code: appliedCoupon.code,
              discountAmount: appliedCoupon.discountAmount,
            }
          : null,
        gstinNumber: gstinNumber,
        guest: true,
      };

      const paymentResult = await processPayment(orderData);

      if (paymentResult.requiresPayment) {
        // Store the order data and payment data for later use
        setOrderDataForPayment({
          orderData: paymentResult.orderData,
          paymentData: paymentResult.paymentData,
        });
        setGuestModalVisible(false);
        // The payment will be handled by the Razorpay component
      } else {
        // COD order placed successfully
        cartCtx.clearCart();
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
        setGuestModalVisible(false);
        setSelectedPaymentMethod(PAYMENT_METHODS.COD);

        showToast(
          `🎉 Order #${paymentResult.orderNumber} placed successfully!`,
          "success",
          4000
        );

        // Send order confirmation email for guest order
        const emailResult = await sendOrderConfirmationEmail(
          { guest: true },
          paymentResult.orderNumber
        );

        clearGuestData();

        navigation.reset({
          index: 0,
          routes: [{ name: "CartMain" }],
        });

        setTimeout(() => {
          showOrderSuccessAlert(
            paymentResult.orderNumber,
            true,
            emailResult.success
          );
        }, 1000);
      }
    } catch (e) {
      showToast("Failed to place order. Please try again.", "error");
    }
    setIsPlacingOrder(false);
  };

  return {
    // Data
    cartItems: cartCtx.items,
    subtotal,
    tax,
    shipping,
    total,
    discount: actualDiscount,
    shippingSavings:
      appliedCoupon?.discountType === "free_shipping" ? standardShipping : 0,
    isAuthenticated: authCtx.isAuthenticated,
    selectedAddress,
    defaultAddress,
    guestData,

    // Payment data
    selectedPaymentMethod,
    orderDataForPayment,

    // Coupon data
    appliedCoupon,
    couponCode,
    isCouponValidating,
    couponError,

    // BBM Bucks data
    bbmBucksBalance: bbmBucksCtx.balance,
    bbmBucksRedemption,
    bbmBucksDiscount,

    // State
    isPlacingOrder,
    guestModalVisible,
    addressSelectorVisible,

    // Handlers
    handlePlaceOrder,
    handleGuestOrder,
    setSelectedAddress,
    setGuestData,
    setGuestModalVisible,
    setAddressSelectorVisible,

    // Payment handlers
    setSelectedPaymentMethod,
    handleDirectPayment,
    handlePaymentSuccess,
    handlePaymentFailure,

    // Coupon handlers
    onCouponCodeChange: setCouponCode,
    onApplyCoupon: handleApplyCoupon,
    onRemoveCoupon: handleRemoveCoupon,

    // BBM Bucks handlers
    onBBMBucksRedeem: handleBBMBucksRedeem,
    onBBMBucksRemove: handleBBMBucksRemove,

    // GSTIN data and handlers
    gstinNumber,
    onGstinChange: setGstinNumber,
  };
}

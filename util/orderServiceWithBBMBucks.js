/**
 * BBM Bucks Order Integration Example
 *
 * This file shows how to integrate BBM Bucks with your existing order processing flow.
 * Adapt this code to your specific payment service implementation.
 */

import BBMBucksService from "./bbmBucksService";

/**
 * Enhanced order processing with BBM Bucks integration
 */
export class OrderServiceWithBBMBucks {
  /**
   * Process order with BBM Bucks redemption and reward
   * @param {Object} orderData - Order information
   * @param {number} bbmBucksToRedeem - BBM Bucks amount to redeem
   * @returns {Object} Order result with BBM Bucks information
   */
  static async processOrder(orderData, bbmBucksToRedeem = 0) {
    try {
      const {
        userId,
        items,
        originalTotal,
        paymentMethod,
        deliveryAddress,
        categories = [],
      } = orderData;

      // 1. Calculate BBM Bucks discount if redemption requested
      let bbmBucksDiscount = 0;
      if (bbmBucksToRedeem > 0 && userId) {
        try {
          // Validate redemption before processing payment
          const userBalance = await BBMBucksService.getUserBalance(userId);
          if (userBalance.currentBalance < bbmBucksToRedeem) {
            throw new Error("Insufficient BBM Bucks balance");
          }

          // Check if BBM Bucks can be used for this order
          const canUseBBMBucks = BBMBucksService.canUseBBMBucks(
            originalTotal,
            categories
          );
          if (!canUseBBMBucks) {
            throw new Error("BBM Bucks cannot be used for this order");
          }

          bbmBucksDiscount = bbmBucksToRedeem / BBMBucksService.CONVERSION_RATE;
        } catch (error) {
          console.error("BBM Bucks validation failed:", error);
          throw new Error(`BBM Bucks Error: ${error.message}`);
        }
      }

      // 2. Calculate final amount after BBM Bucks discount
      const finalTotal = Math.max(0, originalTotal - bbmBucksDiscount);

      // 3. Process payment for final amount
      const paymentResult = await this.processPayment({
        amount: finalTotal,
        paymentMethod,
        userId,
        metadata: {
          originalTotal,
          bbmBucksDiscount,
          bbmBucksRedeemed: bbmBucksToRedeem,
        },
      });

      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      // 4. Create order record
      const order = await this.createOrderRecord({
        orderId: paymentResult.orderId,
        userId,
        items,
        originalTotal,
        bbmBucksDiscount,
        finalTotal,
        paymentResult,
        deliveryAddress,
        categories,
      });

      // 5. Process BBM Bucks transactions after successful payment
      let bbmBucksResult = {
        redeemed: null,
        earned: null,
      };

      if (userId) {
        try {
          // Redeem BBM Bucks if requested
          if (bbmBucksToRedeem > 0) {
            const redemptionResult = await BBMBucksService.redeemBBMBucks(
              userId,
              bbmBucksToRedeem,
              order.orderId
            );
            bbmBucksResult.redeemed = {
              amount: bbmBucksToRedeem,
              discountValue: redemptionResult,
            };
          }

          // Award BBM Bucks for the order (on original total, not discounted)
          const rewardResult = await BBMBucksService.awardBBMBucks(
            userId,
            order.orderId,
            originalTotal, // Award on original amount
            categories
          );
          bbmBucksResult.earned = rewardResult;
        } catch (bbmBucksError) {
          // Log BBM Bucks errors but don't fail the order
          console.error("BBM Bucks processing error:", bbmBucksError);
          // Could implement retry logic or manual processing here
        }
      }

      // 6. Send order confirmation
      await this.sendOrderConfirmation(order, bbmBucksResult);

      return {
        success: true,
        order,
        bbmBucks: bbmBucksResult,
        paymentResult,
      };
    } catch (error) {
      console.error("Order processing failed:", error);
      throw error;
    }
  }

  /**
   * Process payment through your payment gateway
   */
  static async processPayment(paymentData) {
    // Replace with your actual payment processing logic
    // This is just a mock implementation

    try {
      // Simulate payment processing
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Your actual payment gateway integration here
      // e.g., Razorpay, Stripe, etc.

      return {
        success: true,
        orderId,
        transactionId: `txn_${Date.now()}`,
        amount: paymentData.amount,
        currency: "INR",
        status: "completed",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create order record in database
   */
  static async createOrderRecord(orderData) {
    // Replace with your actual database logic
    // This could be Firestore, MongoDB, etc.

    const order = {
      orderId: orderData.orderId,
      userId: orderData.userId,
      items: orderData.items,
      pricing: {
        originalTotal: orderData.originalTotal,
        bbmBucksDiscount: orderData.bbmBucksDiscount,
        finalTotal: orderData.finalTotal,
      },
      paymentInfo: orderData.paymentResult,
      deliveryAddress: orderData.deliveryAddress,
      categories: orderData.categories,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to your database
    // await db.collection('orders').doc(order.orderId).set(order);

    return order;
  }

  /**
   * Send order confirmation with BBM Bucks information
   */
  static async sendOrderConfirmation(order, bbmBucksResult) {
    // Replace with your actual notification logic
    // This could be email, SMS, push notification, etc.

    const confirmationData = {
      orderId: order.orderId,
      userId: order.userId,
      total: order.pricing.finalTotal,
      bbmBucks: {
        redeemed: bbmBucksResult.redeemed,
        earned: bbmBucksResult.earned,
      },
    };

    // Send confirmation
    // await emailService.sendOrderConfirmation(confirmationData);
    // await smsService.sendOrderConfirmation(confirmationData);

    console.log("Order confirmation sent:", confirmationData);
  }

  /**
   * Calculate order categories for BBM Bucks eligibility
   */
  static getOrderCategories(items) {
    const categories = new Set();

    items.forEach((item) => {
      if (item.category) {
        categories.add(item.category.toLowerCase());
      }
      // Handle nested categories if needed
      if (item.subcategory) {
        categories.add(item.subcategory.toLowerCase());
      }
    });

    return Array.from(categories);
  }

  /**
   * Validate BBM Bucks redemption request
   */
  static async validateBBMBucksRedemption(
    userId,
    redeemAmount,
    orderTotal,
    categories
  ) {
    try {
      // Check user balance
      const userBalance = await BBMBucksService.getUserBalance(userId);
      if (userBalance.currentBalance < redeemAmount) {
        return {
          valid: false,
          error: "Insufficient BBM Bucks balance",
        };
      }

      // Check minimum redemption
      if (redeemAmount < BBMBucksService.MINIMUM_REDEMPTION) {
        return {
          valid: false,
          error: `Minimum redemption is ${BBMBucksService.MINIMUM_REDEMPTION} BBM Bucks`,
        };
      }

      // Check maximum redemption (50% of order value)
      const maxRedeemable = BBMBucksService.getMaxRedeemableAmount(
        userBalance.currentBalance,
        orderTotal
      );

      if (redeemAmount > maxRedeemable) {
        return {
          valid: false,
          error: `Maximum redeemable amount is ${maxRedeemable} BBM Bucks`,
        };
      }

      // Check category exclusions
      const canUseBBMBucks = BBMBucksService.canUseBBMBucks(
        orderTotal,
        categories
      );
      if (!canUseBBMBucks) {
        return {
          valid: false,
          error:
            "BBM Bucks cannot be used for this order (excluded categories)",
        };
      }

      return {
        valid: true,
        discountValue: redeemAmount / BBMBucksService.CONVERSION_RATE,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

/**
 * Usage example in a React component or API endpoint:
 */
export const orderProcessingExample = {
  // In your checkout component
  handlePlaceOrder: async (orderData, bbmBucksRedemption) => {
    try {
      const result = await OrderServiceWithBBMBucks.processOrder(
        orderData,
        bbmBucksRedemption.amount
      );

      if (result.success) {
        // Navigate to success screen
        // Show BBM Bucks earned information
        console.log("Order successful:", result.order.orderId);
        console.log("BBM Bucks earned:", result.bbmBucks.earned?.bbmBucks || 0);
      }
    } catch (error) {
      // Handle order processing errors
      console.error("Order failed:", error.message);
      // Show error to user
    }
  },

  // Validate redemption before allowing user to proceed
  validateRedemption: async (userId, amount, orderTotal, categories) => {
    const validation =
      await OrderServiceWithBBMBucks.validateBBMBucksRedemption(
        userId,
        amount,
        orderTotal,
        categories
      );

    if (!validation.valid) {
      // Show error message to user
      alert(validation.error);
      return false;
    }

    return true;
  },
};

export default OrderServiceWithBBMBucks;

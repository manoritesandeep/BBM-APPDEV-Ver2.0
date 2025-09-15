import whatsAppService from "../components/BillingComponents/WhatsApp/WhatsApp";

/**
 * WhatsApp Order Service
 * Handles automated WhatsApp notifications for order confirmations
 */
class WhatsAppOrderService {
  /**
   * Send order confirmation WhatsApp message
   * @param {Object} orderData - Complete order data
   * @param {string} orderNumber - Generated order number
   * @returns {Promise<Object>} Result of the WhatsApp operation
   */
  static async sendOrderConfirmation(orderData, orderNumber) {
    try {
      // Extract customer phone number
      let customerPhone = null;

      if (orderData.phone) {
        // Clean and format phone number
        customerPhone = WhatsAppOrderService.formatPhoneNumber(orderData.phone);
      }

      if (!customerPhone) {
        console.warn(
          "⚠️ No valid phone number found for WhatsApp notification"
        );
        return { success: false, reason: "No phone number" };
      }

      // Prepare order details for WhatsApp
      const orderDetails = WhatsAppOrderService.prepareOrderDetails(
        orderData,
        orderNumber,
        customerPhone
      );

      // console.log("📱 Sending WhatsApp order confirmation:", {
      //   to: customerPhone,
      //   orderNumber: orderNumber,
      //   customerName: orderDetails.customerName,
      // });

      // Send WhatsApp notification to all valid phone numbers
      const result = await whatsAppService.sendOrderConfirmation(
        customerPhone,
        orderDetails
      );

      return result;
    } catch (error) {
      console.error("❌ WhatsApp order service error:", error);
      return { success: false, reason: "Service error", error: error.message };
    }
  }

  /**
   * Prepare order details object
   * @param {Object} orderData - Order data
   * @param {string} orderNumber - Order number
   * @param {string} customerPhone - Customer phone
   * @returns {Object} Prepared order details
   */
  static prepareOrderDetails(orderData, orderNumber, customerPhone) {
    return {
      customerName: WhatsAppOrderService.extractCustomerName(orderData),
      orderNumber: orderNumber,
      total: orderData.total.toFixed(2),
      address: WhatsAppOrderService.formatAddress(orderData.address),
      phone: customerPhone,
      items: orderData.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      trackingLink: `https://buildbharatmart.com/track/${orderNumber}`,
      paymentMethod: orderData.paymentMethod || "COD",
    };
  }

  /**
   * Format phone number for WhatsApp (international format without +)
   * @param {string} phone - Phone number in various formats
   * @returns {string|null} Formatted phone number or null if invalid
   */
  static formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // If starts with +91, remove +
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return cleaned;
    }

    // If starts with 0, remove it and add 91
    if (cleaned.startsWith("0") && cleaned.length === 11) {
      return "91" + cleaned.substring(1);
    }

    // If 10 digits, assume Indian number and add 91
    if (cleaned.length === 10) {
      return "91" + cleaned;
    }

    // If already in international format (starting with country code)
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return cleaned;
    }

    console.warn("⚠️ Invalid phone number format:", phone);
    return null;
  }

  /**
   * Extract customer name from order data
   * @param {Object} orderData - Order data object
   * @returns {string} Customer name
   */
  static extractCustomerName(orderData) {
    // console.log("🔍 Debugging extractCustomerName - Order data structure:", {
    //   isGuest: orderData.guest === true,
    //   guestName: orderData.guestName,
    //   userName: orderData.userName,
    //   userEmail: orderData.userEmail,
    //   addressName: orderData.address?.name, // This should be address label like "Home", "Office"
    //   keys: Object.keys(orderData),
    // });

    // Priority 1: For guest users, use guestName from the guest form
    if (orderData.guest && orderData.guestName) {
      // console.log("✅ Found guestName for guest user:", orderData.guestName);
      return orderData.guestName;
    }

    // Priority 2: For authenticated users, use userName from their profile
    if (!orderData.guest && orderData.userName) {
      // console.log(
      //   "✅ Found userName for authenticated user:",
      //   orderData.userName
      // );
      return orderData.userName;
    }

    // Priority 3: Check other possible name fields (fallback for authenticated users)
    if (orderData.fullName) {
      // console.log("✅ Found fullName:", orderData.fullName);
      return orderData.fullName;
    }

    if (orderData.name) {
      // console.log("✅ Found name:", orderData.name);
      return orderData.name;
    }

    // Priority 4: Last resort - Extract name from email address
    if (orderData.userEmail) {
      const emailName = orderData.userEmail.split("@")[0];
      // Format the email name nicely (capitalize first letter, handle dots/underscores)
      const formattedName = emailName
        .replace(/[._]/g, " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      // console.log("✅ Last resort - Extracted name from email:", formattedName);
      return formattedName;
    }

    // console.log("⚠️ No name found anywhere, using fallback");
    return "Valued Customer";
  }

  /**
   * Format address for display in WhatsApp message
   * @param {Object} address - Address object
   * @returns {string} Formatted address string
   */
  static formatAddress(address) {
    if (!address) return "Address not provided";

    const parts = [];

    if (address.line1) parts.push(address.line1);
    if (address.line2) parts.push(address.line2);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);

    return parts.join(", ") || "Address not provided";
  }

  /**
   * Send order status update via WhatsApp
   * @param {string} phone - Customer phone number
   * @param {string} orderNumber - Order number
   * @param {string} status - New order status
   * @param {string} message - Additional message
   * @returns {Promise<Object>} Result of the WhatsApp operation
   */
  static async sendOrderStatusUpdate(phone, orderNumber, status, message = "") {
    try {
      const formattedPhone = WhatsAppOrderService.formatPhoneNumber(phone);
      if (!formattedPhone) {
        return { success: false, reason: "Invalid phone number" };
      }

      const statusMessage = `📦 Order Update - Build Bharat Mart

Order #${orderNumber}
Status: ${status.toUpperCase()}

${message}

Track your order: https://buildbharatmart.com/track/${orderNumber}

Thank you for choosing Build Bharat Mart! 🛍️`;

      // Send WhatsApp status update to all valid phone numbers
      const result = await whatsAppService.sendTextMessage(
        formattedPhone,
        statusMessage
      );

      if (result.success) {
        console.log("✅ WhatsApp status update sent successfully");
        return { success: true, data: result.data };
      } else {
        console.log("❌ Failed to send WhatsApp status update");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ WhatsApp status update error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default WhatsAppOrderService;

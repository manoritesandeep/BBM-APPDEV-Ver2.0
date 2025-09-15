/**
 * Email template utilities for generating HTML content
 * Provides reusable templates for different email types
 */

const BRAND_COLORS = {
  primary: "#2563eb", // Blue
  secondary: "#f59e0b", // Amber
  success: "#10b981", // Green
  text: "#374151", // Gray-700
  textLight: "#6b7280", // Gray-500
  background: "#f9fafb", // Gray-50
  white: "#ffffff",
};

const BASE_STYLES = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: ${BRAND_COLORS.text}; 
    margin: 0; 
    padding: 0; 
    background-color: ${BRAND_COLORS.background};
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: ${BRAND_COLORS.white}; 
    border-radius: 8px; 
    overflow: hidden; 
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .header { 
    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary}); 
    color: ${BRAND_COLORS.white}; 
    padding: 30px 20px; 
    text-align: center; 
  }
  .header h1 { 
    margin: 0; 
    font-size: 28px; 
    font-weight: 700; 
  }
  .header p { 
    margin: 10px 0 0; 
    font-size: 16px; 
    opacity: 0.9; 
  }
  .content { 
    padding: 30px 20px; 
  }
  .footer { 
    background-color: ${BRAND_COLORS.background}; 
    padding: 20px; 
    text-align: center; 
    font-size: 14px; 
    color: ${BRAND_COLORS.textLight}; 
  }
  .button { 
    display: inline-block; 
    background-color: ${BRAND_COLORS.success}; 
    color: ${BRAND_COLORS.white} !important; 
    padding: 14px 28px; 
    text-decoration: none; 
    border-radius: 8px; 
    margin: 15px 0; 
    font-weight: 600;
    font-size: 16px;
    border: 2px solid ${BRAND_COLORS.success};
    transition: all 0.3s ease;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  .button:hover {
    background-color: ${BRAND_COLORS.primary};
    border-color: ${BRAND_COLORS.primary};
    color: ${BRAND_COLORS.white} !important;
  }
  .order-item { 
    border: 1px solid #e5e7eb; 
    border-radius: 6px; 
    padding: 15px; 
    margin: 10px 0; 
    background-color: #fafafa; 
  }
  .price { 
    font-weight: 700; 
    color: ${BRAND_COLORS.primary}; 
  }
  .total { 
    background-color: ${BRAND_COLORS.success}; 
    color: ${BRAND_COLORS.white}; 
    padding: 15px; 
    border-radius: 6px; 
    font-size: 18px; 
    font-weight: 700; 
    text-align: center; 
    margin: 20px 0; 
  }
`;

export class EmailTemplates {
  static generateBaseTemplate(content, headerTitle = "Build Bharat Mart") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headerTitle}</title>
        <style>${BASE_STYLES}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ Build Bharat Mart</h1>
            <p>Building Your Dreams, One Tool at a Time!</p>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Thank you for choosing Build Bharat Mart</p>
            <p>📧 Contact us: support@buildbharatmart.com | 📞 +91-XXXXXXXXXX</p>
            <p>&copy; ${new Date().getFullYear()} Build Bharat Mart. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static welcomeTemplate(userName) {
    const content = `
      <h2>Welcome ${userName}! 🎉</h2>
      <p>Welcome to Build Bharat Mart - your one-stop destination for all construction tools and equipment!</p>
      
      <p>We're excited to have you join our community of builders, contractors, and DIY enthusiasts.</p>
      
      <div style="background-color: ${BRAND_COLORS.background}; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3>What's Next?</h3>
        <ul>
          <li>🛠️ Browse our extensive catalog of premium tools</li>
          <li>💰 Earn BBM Bucks with every purchase</li>
          <li>🚚 Enjoy fast and reliable delivery</li>
          <li>🎁 Get exclusive member discounts</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="#" class="button">Start Shopping Now</a>
      </div>
      
      <p>If you have any questions, our customer support team is here to help!</p>
    `;

    return this.generateBaseTemplate(content, "Welcome to Build Bharat Mart");
  }

  static orderConfirmationTemplate(orderData) {
    const {
      orderNum,
      customerName,
      orderItems = [],
      orderTotal,
      deliveryAddress,
      estimatedDelivery,
      paymentMethod,
    } = orderData;

    const itemsHtml = orderItems
      .map(
        (item) => `
      <div class="order-item">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div style="flex: 1; padding-right: 10px;">
            <h4 style="margin: 0; color: ${
              BRAND_COLORS.text
            }; font-size: 16px; line-height: 1.3;">${item.name}</h4>
          </div>
          <div style="min-width: 80px; text-align: right;">
            <div class="price" style="font-size: 16px;">₹${item.price}</div>
          </div>
        </div>
        <p style="margin: 0; color: ${
          BRAND_COLORS.textLight
        }; font-size: 14px;">
          Quantity: ${item.quantity} | Size: ${item.size || "Standard"}
        </p>
      </div>
    `
      )
      .join("");

    const content = `
      <h2>Order Confirmation 📦</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
      
      <div style="background-color: ${
        BRAND_COLORS.background
      }; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNum}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod || "Card"}</p>
        <p><strong>Estimated Delivery:</strong> ${
          estimatedDelivery || "3-5 business days"
        }</p>
      </div>

      <h3>Items Ordered</h3>
      ${itemsHtml}
      
      <div class="total">
        Total: ₹${orderTotal}
      </div>

      ${
        deliveryAddress
          ? `
        <div style="background-color: ${BRAND_COLORS.background}; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Delivery Address</h3>
          <p>${deliveryAddress}</p>
        </div>
      `
          : ""
      }

      <div style="text-align: center;">
        <a href="#" class="button">Track Your Order</a>
      </div>
      
      <p>We'll send you another email when your order ships. Thank you for choosing Build Bharat Mart!</p>
    `;

    return this.generateBaseTemplate(
      content,
      `Order Confirmation - ${orderNum}`
    );
  }

  static orderShippedTemplate(orderData) {
    const { orderNum, customerName, trackingNumber, estimatedDelivery } =
      orderData;

    const content = `
      <h2>Your Order is on the Way! 🚛</h2>
      <p>Hi ${customerName},</p>
      <p>Great news! Your order <strong>${orderNum}</strong> has been shipped and is on its way to you.</p>
      
      <div style="background-color: ${BRAND_COLORS.background}; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Shipping Details</h3>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
      </div>

      <div style="text-align: center;">
        <a href="#" class="button">Track Package</a>
      </div>
      
      <p>You'll receive another email when your package is delivered. Thank you for your patience!</p>
    `;

    return this.generateBaseTemplate(content, `Order Shipped - ${orderNum}`);
  }

  static passwordResetTemplate(userName, resetLink) {
    const content = `
      <h2>Reset Your Password 🔐</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your Build Bharat Mart account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
    `;

    return this.generateBaseTemplate(content, "Password Reset Request");
  }
}

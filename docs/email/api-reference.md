# 📧 Email System API Reference

## Core Services

### EmailService

Central service for sending emails via Firebase Email Extension.

#### `EmailService.sendEmail(emailData)`

Sends a single email by creating a document in the Firebase `mail` collection.

**Parameters:**

- `emailData` (Object): Email configuration object

**Returns:** `Promise<{success: boolean, docId?: string, error?: string}>`

**Example:**

```javascript
import { EmailService } from "../components/Email";

const result = await EmailService.sendEmail({
  to: ["user@example.com"],
  cc: ["manager@example.com"], // Optional
  bcc: ["audit@example.com"], // Optional
  message: {
    subject: "Order Confirmation",
    text: "Plain text version",
    html: "<h1>HTML version</h1>",
    attachments: [], // Optional
  },
  template: {
    type: "order_confirmation",
    version: "1.0",
  },
  metadata: {
    userId: "user123",
    orderNumber: "BBM-12345",
  },
});

if (result.success) {
  console.log("Email sent, doc ID:", result.docId);
} else {
  console.error("Email failed:", result.error);
}
```

#### `EmailService.sendBulkEmails(emailsData)`

Sends multiple emails with automatic rate limiting.

**Parameters:**

- `emailsData` (Array): Array of email configuration objects

**Returns:** `Promise<Array<{success: boolean, docId?: string, error?: string}>>`

**Example:**

```javascript
const results = await EmailService.sendBulkEmails([
  {
    to: ["user1@example.com"],
    message: { subject: "Email 1", html: "Content 1" },
  },
  {
    to: ["user2@example.com"],
    message: { subject: "Email 2", html: "Content 2" },
  },
]);

const successCount = results.filter((r) => r.success).length;
console.log(`${successCount}/${results.length} emails sent successfully`);
```

---

### EmailTemplates

Pre-built HTML email templates with BBM branding.

#### `EmailTemplates.welcomeTemplate(userName)`

Generates welcome email HTML for new users.

**Parameters:**

- `userName` (string): Name of the new user

**Returns:** `string` - Complete HTML email

**Example:**

```javascript
import { EmailTemplates } from "../components/Email";

const html = EmailTemplates.welcomeTemplate("John Doe");
// Returns branded HTML welcome email
```

#### `EmailTemplates.orderConfirmationTemplate(orderData)`

Generates order confirmation email HTML.

**Parameters:**

- `orderData` (Object): Order information

**OrderData Structure:**

```javascript
{
  orderNum: string,           // e.g., "BBM-12345"
  customerName: string,       // Customer's name
  orderItems: Array<{         // Array of ordered items
    name: string,             // Item name
    quantity: number,         // Quantity ordered
    size: string,            // Item size/variant
    price: string            // Item price (formatted)
  }>,
  orderTotal: string,         // Total amount (formatted)
  deliveryAddress: string,    // Full delivery address
  estimatedDelivery: string,  // Delivery timeframe
  paymentMethod: string       // Payment method used
}
```

**Returns:** `string` - Complete HTML email

**Example:**

```javascript
const orderData = {
  orderNum: "BBM-12345",
  customerName: "John Doe",
  orderItems: [
    { name: "Power Drill", quantity: 1, size: "Standard", price: "2,999" },
  ],
  orderTotal: "3,538",
  deliveryAddress: "123 Main St, City, State - 12345",
  estimatedDelivery: "3-5 business days",
  paymentMethod: "UPI",
};

const html = EmailTemplates.orderConfirmationTemplate(orderData);
```

#### `EmailTemplates.orderShippedTemplate(orderData)`

Generates shipping notification email HTML.

**Parameters:**

- `orderData` (Object): Shipping information

**ShippingData Structure:**

```javascript
{
  orderNum: string,
  customerName: string,
  trackingNumber: string,
  estimatedDelivery: string
}
```

#### `EmailTemplates.generateBaseTemplate(content, headerTitle?)`

Creates a custom email using the base BBM template.

**Parameters:**

- `content` (string): HTML content for email body
- `headerTitle` (string, optional): Custom header title

**Returns:** `string` - Complete HTML email

**Example:**

```javascript
const customContent = `
  <h2>Custom Email</h2>
  <p>Your custom content here...</p>
`;

const html = EmailTemplates.generateBaseTemplate(customContent, "Custom Email");
```

---

## Hooks

### useUserEmails

Hook for user-related email operations.

#### Available Methods

```javascript
import { useUserEmails } from "../components/Email/User/useUserEmails";

const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAccountVerificationEmail,
} = useUserEmails();
```

#### `sendWelcomeEmail(userEmail, userName)`

**Parameters:**

- `userEmail` (string): User's email address
- `userName` (string): User's name

**Returns:** `Promise<{success: boolean, error?: string}>`

#### `sendPasswordResetEmail(userEmail, userName, resetLink)`

**Parameters:**

- `userEmail` (string): User's email address
- `userName` (string): User's name
- `resetLink` (string): Password reset URL

#### `sendAccountVerificationEmail(userEmail, userName, verificationLink)`

**Parameters:**

- `userEmail` (string): User's email address
- `userName` (string): User's name
- `verificationLink` (string): Account verification URL

---

### useBillingEmails

Hook for order and billing-related email operations.

#### Available Methods

```javascript
import { useBillingEmails } from "../components/Email/Billing/useBillingEmails";

const {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendReceiptEmail,
  triggerOrderConfirmationEmail,
} = useBillingEmails();
```

#### `sendOrderConfirmationEmail(orderData, recipientEmail?)`

**Parameters:**

- `orderData` (Object): Complete order information
- `recipientEmail` (string, optional): Override recipient email

**Returns:** `Promise<{success: boolean, error?: string}>`

#### `triggerOrderConfirmationEmail(orderData)`

Automatically determines recipient email from auth context or order data.

**Parameters:**

- `orderData` (Object): Complete order information

#### `sendOrderShippedEmail(orderData, recipientEmail?)`

**Parameters:**

- `orderData` (Object): Order and shipping information
- `recipientEmail` (string, optional): Override recipient email

#### `sendReceiptEmail(orderData, recipientEmail?)`

**Parameters:**

- `orderData` (Object): Order and payment information
- `recipientEmail` (string, optional): Override recipient email

---

### useEmailIntegration

High-level integration hook for automatic email triggering.

#### Available Methods

```javascript
import { useEmailIntegration } from "../hooks/useEmailIntegration";

const {
  handleOrderPlaced,
  handleUserRegistered,
  handleOrderShipped,
  handleBulkOrderNotifications,
} = useEmailIntegration();
```

#### `handleOrderPlaced(orderData)`

Automatically sends order confirmation email for placed orders.

**Parameters:**

- `orderData` (Object): Order information with customer details

**Usage:**

```javascript
// In billing flow after successful payment
const result = await handleOrderPlaced({
  orderNum: 'BBM-12345',
  customerName: 'John Doe',
  customerEmail: 'john@example.com', // Or guestEmail for guests
  orderItems: [...],
  orderTotal: '2999'
});
```

#### `handleUserRegistered(userEmail, userName)`

Automatically sends welcome email for new users.

**Parameters:**

- `userEmail` (string): New user's email
- `userName` (string): New user's name

**Usage:**

```javascript
// In signup flow after successful registration
await handleUserRegistered("john@example.com", "John Doe");
```

#### `handleOrderShipped(orderData)`

Sends shipping notification when order status changes.

**Parameters:**

- `orderData` (Object): Order and tracking information

#### `handleBulkOrderNotifications(orders)`

Sends bulk order notifications (admin use).

**Parameters:**

- `orders` (Array): Array of order objects

---

## Components

### SendWelcomeEmail

React component for sending welcome emails.

#### Props

```javascript
<SendWelcomeEmail
  userEmail="john@example.com" // User's email address
  userName="John Doe" // User's name
  autoSend={true} // Automatically send on mount
  onEmailSent={(result, data) => {
    // Callback when email sent
    console.log("Welcome email result:", result);
  }}
  showDemo={false} // Show demo UI (development only)
/>
```

### SendOrderConfirmationEmail

React component for sending order confirmation emails.

#### Props

```javascript
<SendOrderConfirmationEmail
  orderData={orderObject} // Complete order data
  onEmailSent={(result, data) => {
    // Callback when email sent
    console.log("Order email result:", result);
  }}
  showDemo={false} // Show demo UI (development only)
/>
```

---

## Data Structures

### Email Data Object

```typescript
interface EmailData {
  to: string[]; // Recipient email addresses
  cc?: string[]; // CC recipients (optional)
  bcc?: string[]; // BCC recipients (optional)
  message: {
    subject: string; // Email subject line
    text?: string; // Plain text version (optional)
    html: string; // HTML content (required)
    attachments?: Array<{
      // File attachments (optional)
      filename: string;
      content: string; // Base64 encoded content
      contentType: string;
    }>;
  };
  template?: {
    // Template metadata (optional)
    type: string; // Template type identifier
    version: string; // Template version
  };
  metadata?: {
    // Additional metadata (optional)
    userId?: string;
    orderNum?: string;
    emailType?: string;
    [key: string]: any;
  };
}
```

### Order Data Object

```typescript
interface OrderData {
  orderNum: string; // Order number (e.g., "BBM-12345")
  customerName: string; // Customer's full name
  customerEmail?: string; // Customer email (auth users)
  guestEmail?: string; // Guest email (guest users)
  orderItems: Array<{
    name: string; // Item name
    quantity: number; // Quantity ordered
    size?: string; // Size/variant
    price: string; // Formatted price
  }>;
  orderTotal: string; // Formatted total amount
  deliveryAddress?: string; // Full delivery address
  estimatedDelivery?: string; // Delivery timeframe
  paymentMethod?: string; // Payment method used
  transactionId?: string; // Transaction reference
  trackingNumber?: string; // Shipping tracking number
}
```

---

## Error Handling

### Common Error Types

```javascript
// Network errors
{ success: false, error: "Network request failed" }

// Validation errors
{ success: false, error: "Email recipient(s) required" }
{ success: false, error: "Email subject and HTML content required" }

// Firebase errors
{ success: false, error: "Firebase DB not initialized" }

// Template errors
{ success: false, error: "Missing required template data" }
```

### Error Handling Best Practices

```javascript
// Always handle email failures gracefully
const result = await EmailService.sendEmail(emailData);

if (result.success) {
  // Update UI to show email was sent
  showSuccessMessage("Confirmation email sent!");
} else {
  // Don't fail the main operation, just log and inform user
  console.error("Email failed:", result.error);
  showWarningMessage(
    "Order placed successfully. Email confirmation may be delayed."
  );
}
```

---

## Firebase Integration

### Required Collections

#### `mail` Collection

- **Purpose:** Email queue for Firebase Email Extension
- **Documents:** Auto-generated IDs
- **Structure:**

```javascript
{
  to: ['user@example.com'],
  message: {
    subject: 'Subject',
    html: '<html>...</html>',
    text: 'Plain text'
  },
  template: { type: 'welcome', version: '1.0' },
  metadata: { userId: 'abc123', emailType: 'welcome' }
}
```

#### Security Rules

```javascript
// Firestore rules for mail collection
match /mail/{document} {
  // Only allow server-side writes (from authenticated app)
  allow write: if request.auth != null;
  // No read access (processed by extension)
  allow read: if false;
}
```

### Extension Configuration

The Firebase Email Extension requires:

1. **SMTP Provider:** Gmail, SendGrid, AWS SES, etc.
2. **Collection Name:** `mail` (default)
3. **Authentication:** SMTP credentials
4. **Rate Limiting:** Configured per provider limits

---

**Last Updated:** August 28, 2025  
**Version:** 1.0  
**Maintainer:** Build Bharat Mart Development Team

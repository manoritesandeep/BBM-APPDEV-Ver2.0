# 📧 Build Bharat Mart Email System

A production-ready email system built for React Native with Firebase Email Extension integration. Handles welcome emails, order confirmations, shipping notifications, and more.

## 🎯 Features

- **Reusable Templates**: HTML email templates with BBM branding
- **Automatic Triggering**: Emails sent automatically on user actions
- **Auth Integration**: Works with both authenticated and guest users
- **Error Handling**: Robust error handling and logging
- **Type Safety**: Well-documented with TypeScript-style JSDoc
- **Demo System**: Complete demo component for testing
- **Performance Optimized**: Minimal re-renders and efficient batching

## 🏗️ Architecture

```
components/Email/
├── EmailService.js          # Core email sending logic
├── EmailTemplates.js        # HTML email templates
├── index.js                 # Main exports
├── EmailSystemDemo.js       # Demo component
├── User/
│   ├── useUserEmails.js     # User email hooks
│   └── SendWelcomeEmail.js  # Welcome email component
└── Billing/
    ├── useBillingEmails.js  # Billing email hooks
    └── SendOrderConfirmationEmail.js # Order email component

hooks/
└── useEmailIntegration.js   # Integration hooks for app flows
```

## 🚀 Quick Start

### 1. Basic Usage

```jsx
import {
  useEmailIntegration,
  SendOrderConfirmationEmail,
} from "../components/Email";

// In your order completion component
const { handleOrderPlaced } = useEmailIntegration();

// Automatically send confirmation email
await handleOrderPlaced(orderData);
```

### 2. Manual Email Sending

```jsx
import { useBillingEmails } from '../components/Email';

const { sendOrderConfirmationEmail } = useBillingEmails();

const orderData = {
  orderNum: "BBM-12345",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  orderItems: [...],
  orderTotal: "2,999",
  // ... other order data
};

await sendOrderConfirmationEmail(orderData);
```

### 3. Welcome Email on Registration

```jsx
import { SendWelcomeEmail } from "../components/Email";

// Auto-send welcome email
<SendWelcomeEmail
  userEmail="user@example.com"
  userName="John Doe"
  autoSend={true}
/>;
```

## 📧 Email Types

### Welcome Email

- **Trigger**: User registration
- **Recipient**: New user
- **Content**: Welcome message, features overview, call-to-action

### Order Confirmation

- **Trigger**: Order placement
- **Recipient**: Customer (authenticated or guest)
- **Content**: Order details, items, total, delivery info

### Shipping Notification

- **Trigger**: Order status change to "shipped"
- **Recipient**: Customer
- **Content**: Tracking number, estimated delivery

### Password Reset

- **Trigger**: Password reset request
- **Recipient**: User requesting reset
- **Content**: Secure reset link with expiration

## 🔧 Integration Guide

### For Billing Screen

```jsx
import { useEmailIntegration } from "../hooks/useEmailIntegration";

function BillingScreen() {
  const { handleOrderPlaced } = useEmailIntegration();

  const completeOrder = async (orderData) => {
    try {
      // Process payment
      const paymentResult = await processPayment(orderData);

      if (paymentResult.success) {
        // Automatically send confirmation email
        await handleOrderPlaced(orderData);

        // Navigate to success screen
        navigation.navigate("OrderSuccess");
      }
    } catch (error) {
      console.error("Order completion failed:", error);
    }
  };

  // ... rest of component
}
```

### For User Registration

```jsx
import { useEmailIntegration } from "../hooks/useEmailIntegration";

function SignUpScreen() {
  const { handleUserRegistered } = useEmailIntegration();

  const handleSignUp = async (userData) => {
    try {
      // Create user account
      const user = await createAccount(userData);

      if (user.success) {
        // Send welcome email
        await handleUserRegistered(userData.email, userData.name);

        // Navigate to app
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  // ... rest of component
}
```

## 🎨 Email Templates

### Customizing Templates

The `EmailTemplates` class provides flexible HTML templates:

```jsx
import { EmailTemplates } from "../components/Email";

// Use existing templates
const welcomeHtml = EmailTemplates.welcomeTemplate("John Doe");
const orderHtml = EmailTemplates.orderConfirmationTemplate(orderData);

// Create custom template
const customHtml = EmailTemplates.generateBaseTemplate(`
  <h2>Custom Content</h2>
  <p>Your custom email content here</p>
`);
```

### Template Features

- **Responsive Design**: Works on all email clients
- **BBM Branding**: Consistent brand colors and styling
- **Rich Content**: HTML support for images, buttons, tables
- **Accessibility**: Proper semantic markup and alt text

## 🛠️ Configuration

### Firebase Email Extension Setup

1. Install Firebase Email Extension in your project
2. Configure SMTP settings in Firebase Console
3. Set up email templates collection structure
4. Configure authentication and security rules

### Environment Variables

```env
# Firebase configuration already handled in firebaseConfig.js
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
# ... other Firebase config
```

## 🧪 Testing

### Demo Component

Use the `EmailSystemDemo` component to test all email functionality:

```jsx
import { EmailSystemDemo } from "../components/Email";

// In your app or dev screen
<EmailSystemDemo />;
```

### Manual Testing

```jsx
// Test individual emails
const { sendWelcomeEmail } = useUserEmails();
const { sendOrderConfirmationEmail } = useBillingEmails();

// Test with demo data
await sendWelcomeEmail("test@example.com", "Test User");
await sendOrderConfirmationEmail(demoOrderData);
```

## 📊 Monitoring & Analytics

### Email Status Tracking

All email sends return detailed results:

```jsx
const result = await sendOrderConfirmationEmail(orderData);

if (result.success) {
  console.log("Email sent successfully:", result.docId);
} else {
  console.error("Email failed:", result.error);
}
```

### Firebase Console Monitoring

- Check `mail` collection for queued emails
- Monitor Firebase extension logs
- Track delivery rates and failures

## 🔐 Security & Privacy

- **Data Protection**: Minimal personal data stored in email queue
- **Secure Templates**: XSS protection in template generation
- **Rate Limiting**: Built-in delays for bulk operations
- **Error Handling**: No sensitive data in error logs

## 🚀 Performance Optimization

- **Async Operations**: Non-blocking email sending
- **Batch Processing**: Efficient bulk email handling
- **Template Caching**: Optimized template generation
- **Firebase Optimization**: Minimal Firestore reads/writes

## 📱 User Experience

- **Silent Operation**: Emails sent in background
- **Status Feedback**: Clear success/error messages
- **Graceful Degradation**: App works even if emails fail
- **Fast UI**: No blocking operations in UI thread

## 🔄 Future Enhancements

- [ ] Email delivery status webhooks
- [ ] A/B testing for email templates
- [ ] Email preference management
- [ ] Scheduled email campaigns
- [ ] Advanced analytics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Firebase DB not initialized**

   - Ensure `firebaseConfig.js` is properly configured
   - Check Firebase project settings

2. **Email not sending**

   - Verify Firebase Email Extension is installed
   - Check SMTP configuration in Firebase Console
   - Review Firebase security rules

3. **Template rendering issues**
   - Validate order data structure
   - Check for missing required fields

### Debug Mode

Enable detailed logging:

```jsx
// In development
if (__DEV__) {
  console.log("Email system debug mode enabled");
}
```

## 📄 License

Part of Build Bharat Mart application. All rights reserved.

---

**Build Bharat Mart** - Building Your Dreams, One Tool at a Time! 🏗️

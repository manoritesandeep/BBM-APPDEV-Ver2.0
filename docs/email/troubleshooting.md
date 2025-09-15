# 🛠️ Email System Troubleshooting Guide

## Common Issues and Solutions

### 1. No Welcome Email After Signup

#### Symptoms

- User completes registration successfully
- No welcome email received
- Console shows signup success but no email logs

#### Diagnostic Steps

1. **Check Console Logs**

   ```
   Look for: "✅ Welcome email sent to [name] ([email])"
   Or error: "❌ Welcome email error: [error message]"
   ```

2. **Verify Firebase Extension**

   - Go to Firebase Console > Extensions
   - Check if "Trigger Email from Firebase" is installed and active
   - Review extension logs for processing errors

3. **Check Email Queue**
   - Firebase Console > Firestore Database
   - Look for `mail` collection
   - Verify documents are being created

#### Common Causes & Solutions

**Cause: Firebase Extension Not Configured**

```
Solution:
1. Install "Trigger Email from Firebase" extension
2. Configure SMTP settings in extension
3. Test with a sample email
```

**Cause: User Profile Creation Failed**

```
Solution:
1. Check Firestore security rules allow user creation
2. Verify Firebase authentication is working
3. Check network connectivity during signup
```

**Cause: Email Service Import Error**

```javascript
// Check if imports are correct in util/auth.js
import { EmailService, EmailTemplates } from "../components/Email";
```

### 2. No Order Confirmation Email

#### Symptoms

- Order placed successfully
- Success message doesn't mention email sent
- No order confirmation email received

#### Diagnostic Steps

1. **Check Order Flow Logs**

   ```
   Look for: "✅ Order confirmation email sent for order [orderNumber]"
   Or error: "❌ Order confirmation email error: [error]"
   ```

2. **Verify User Email Availability**

   - For authenticated users: Check auth context has email
   - For guest users: Check guest form captures email

3. **Check Cart Context Data**
   - Verify cart items are available when email is sent
   - Ensure cart isn't cleared before email processing

#### Common Causes & Solutions

**Cause: Email Data Missing**

```javascript
// Fix: Ensure user email is available
if (authCtx.isAuthenticated) {
  customerEmail = userCtx.userProfile?.email || authCtx.userEmail;
} else if (guestData.email) {
  customerEmail = guestData.email;
}
```

**Cause: Cart Cleared Before Email**

```javascript
// Fix: Send email before clearing cart
const emailResult = await sendOrderConfirmationEmail(orderData, orderNumber);
cartCtx.clearCart(); // Clear after email sent
```

**Cause: Guest Data Cleared Too Early**

```javascript
// Fix: Clear guest data after email sent
const emailResult = await sendOrderConfirmationEmail(orderData, orderNumber);
clearGuestData(); // Clear after email sent
```

### 3. Firebase Extension Issues

#### Extension Not Processing Emails

**Check Extension Status**

```
1. Firebase Console > Extensions > Trigger Email
2. Look for "Active" status
3. Check extension logs for errors
```

**Common Extension Errors**

- SMTP authentication failed
- Rate limiting exceeded
- Invalid email format

**Solutions**

```
1. Reconfigure SMTP settings
2. Verify email provider credentials
3. Check email format validation
4. Review rate limits and quotas
```

### 4. Email Template Issues

#### Symptoms

- Emails sent but appear broken or unstyled
- Missing order details or customer information
- Template rendering errors

#### Solutions

**Fix Template Data**

```javascript
// Ensure all required data is provided
const emailOrderData = {
  orderNum: orderNumber,
  customerName: customerName || "Valued Customer",
  orderItems: orderItems || [],
  orderTotal: total?.toString() || "0",
  deliveryAddress: deliveryAddress || "Address not provided",
  // ... other required fields
};
```

**Validate Template Generation**

```javascript
try {
  const html = EmailTemplates.orderConfirmationTemplate(emailOrderData);
  console.log("Template generated successfully");
} catch (error) {
  console.error("Template generation failed:", error);
}
```

### 5. Development Environment Issues

#### Firebase Emulator Configuration

**Problem: Emails not sending in development**

```javascript
// Check if using Firebase emulator
// Emulator may not process email extension
```

**Solution: Test with Live Firebase**

```
1. Use live Firebase project for email testing
2. Or configure email extension in emulator
3. Add console logging to verify email queue creation
```

#### Network Issues

```javascript
// Add timeout and retry logic
const result = await EmailService.sendEmail(emailData);
if (!result.success && result.error.includes("network")) {
  // Retry after delay
  setTimeout(async () => {
    await EmailService.sendEmail(emailData);
  }, 5000);
}
```

## Debug Checklist

### Pre-Signup Debug

- [ ] Firebase Email Extension installed and active
- [ ] SMTP configuration complete in Firebase Console
- [ ] Test email sent successfully from Firebase Console

### Signup Debug

- [ ] Console shows "✅ Verification email sent successfully during signup"
- [ ] Console shows "✅ Welcome email sent to [name] ([email])"
- [ ] Firestore `users` collection has new user document
- [ ] Firestore `mail` collection has welcome email document

### Pre-Order Debug

- [ ] User email available in auth context (logged in users)
- [ ] Guest email captured in checkout form (guest users)
- [ ] Cart has items with proper structure

### Order Debug

- [ ] Console shows "✅ Order [number] saved to Firestore"
- [ ] Console shows "✅ Order confirmation email sent for order [number]"
- [ ] Success alert mentions "confirmation email has been sent"
- [ ] Firestore `mail` collection has order confirmation document

### Email Delivery Debug

- [ ] Firebase extension logs show email processing
- [ ] Check spam/junk folders
- [ ] Verify email address is valid and accessible
- [ ] Test with different email providers (Gmail, Outlook, etc.)

## Emergency Fixes

### If Emails Completely Stop Working

1. **Immediate Action**

   ```javascript
   // Add fallback notification in success alert
   const message = `Your order #${orderNumber} has been placed.\n\nIf you don't receive a confirmation email within 15 minutes, please contact support with your order number.`;
   ```

2. **Quick Diagnostic**

   ```bash
   # Check if Firebase extension is running
   # Firebase Console > Extensions > Trigger Email > Logs
   ```

3. **Temporary Workaround**
   ```javascript
   // Log email data for manual sending
   console.log("EMAIL BACKUP DATA:", {
     to: customerEmail,
     orderNumber: orderNumber,
     customerName: customerName,
     orderTotal: total,
   });
   ```

### If Welcome Emails Fail

1. **User Experience Fix**

   ```javascript
   // Don't fail signup if welcome email fails
   try {
     await EmailService.sendEmail(welcomeEmailData);
   } catch (error) {
     console.error("Welcome email failed, but signup continues");
     // Continue with successful signup flow
   }
   ```

2. **Manual Welcome Process**
   ```javascript
   // Store users who need welcome emails
   await setDoc(doc(db, "pending_welcome_emails", userId), {
     email: email,
     name: name,
     createdAt: new Date(),
   });
   ```

## Monitoring Setup

### Production Monitoring

1. **Firebase Console Monitoring**

   - Extension execution logs
   - Firestore mail collection growth
   - Error rates and patterns

2. **Application Logging**

   ```javascript
   // Add structured logging
   console.log("EMAIL_METRICS", {
     type: "welcome|order_confirmation",
     success: true | false,
     userId: userId,
     timestamp: new Date().toISOString(),
     error: errorMessage || null,
   });
   ```

3. **User Feedback Tracking**
   - Support tickets about missing emails
   - User reports of email delivery issues
   - Email engagement metrics

### Alerting

Set up alerts for:

- High email failure rates (>5%)
- Firebase extension errors
- SMTP provider issues
- Sudden drop in email volume

---

## Contact Information

**For Email System Issues:**

- Check this troubleshooting guide first
- Review Firebase Console logs
- Contact team lead with specific error messages
- Include console logs and user details in reports

**Last Updated:** August 28, 2025

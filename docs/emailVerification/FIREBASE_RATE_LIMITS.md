# Firebase Email Verification Rate Limits - Complete Guide

## Firebase's Rate Limiting Rules

Firebase implements strict rate limits for email verification to prevent spam and abuse:

### **Per User Limits:**

- **5 verification emails per hour** per individual user
- **After 5 attempts:** User is blocked for 1+ hours
- **Daily limit:** Additional restrictions may apply

### **Per Project Limits:**

- **100 verification emails per day** across entire project
- **Burst protection:** Rapid successive calls are blocked
- **IP-based limiting:** Additional restrictions per IP address

### **Block Duration:**

- **Minimum:** 1 hour after hitting limits
- **Maximum:** Can extend to 24+ hours for repeated violations
- **Progressive:** Longer blocks for repeated offenses

## Error Messages You'll See

When rate limits are hit, Firebase returns:

```
{
  "error": {
    "code": 400,
    "message": "TOO_MANY_ATTEMPTS_TRY_LATER"
  }
}
```

## Our Solution Implementation

### 1. **Proactive Rate Limiting**

- Track attempts locally using `EmailVerificationTracker`
- Prevent hitting Firebase limits by implementing our own limits
- Conservative approach: max 3 attempts per hour (vs Firebase's 5)

### 2. **Smart Error Handling**

- Detect Firebase blocks automatically
- Store block timestamps locally
- Provide helpful user messaging

### 3. **User Experience Improvements**

- Clear countdown timers showing when users can retry
- Helpful troubleshooting tips
- Progressive messaging based on attempt count

### 4. **Multiple Rate Limit Types**

```javascript
// App-level: 5 minutes between attempts (user convenience)
APP_RATE_LIMIT_DURATION = 300000; // 5 minutes

// Conservative hourly limit to avoid Firebase blocks
MAX_ATTEMPTS_PER_HOUR = 3; // vs Firebase's 5

// Firebase block duration
FIREBASE_RATE_LIMIT_DURATION = 3600000; // 1 hour
```

## User Flow & Messaging

### **First Attempt**

- ✅ Email sent immediately
- No restrictions

### **Second Attempt (within 5 minutes)**

- ⏱️ "Please wait X minutes before sending another email"
- Gentle rate limiting for UX

### **Third Attempt (within 1 hour)**

- ⚠️ "You've requested several emails recently. Please check your inbox and wait..."
- Warning about approaching limits

### **Fourth+ Attempt**

- 🚫 "We've reached the email sending limit. Check your inbox and spam folder..."
- Blocked to prevent Firebase penalties

### **Firebase Block Detected**

- 🔥 "We've sent you several verification emails already. To prevent spam, Firebase has temporarily limited email sending..."
- Clear explanation and next steps

## Best Practices for Users

### **Email Troubleshooting Tips:**

1. **Check spam/junk folder** - Most common issue
2. **Look for Firebase/noreply emails** - Specific sender patterns
3. **Add domain to safe senders** - Prevent future spam filtering
4. **Wait 2-3 minutes** - Email delivery can be delayed
5. **Check email spelling** - Typos cause failed delivery

### **Avoid Rate Limits:**

1. **Don't spam the resend button** - Wait between attempts
2. **Check email thoroughly first** - Before requesting new emails
3. **Use "Check Verification" button** - If you clicked the email link
4. **Contact support if needed** - For persistent issues

## Technical Implementation

### **Rate Limit Tracking**

```javascript
// Store in AsyncStorage
{
  attempts: [timestamp1, timestamp2, timestamp3], // Last hour attempts
  lastFirebaseBlock: timestamp // When Firebase last blocked us
}
```

### **Smart Checking**

```javascript
// Before sending email
const canSend = await EmailVerificationTracker.canSendEmail();
if (!canSend.canSend) {
  // Show appropriate message based on reason
  throw new Error(getAppropriateMessage(canSend.reason, canSend.timeRemaining));
}
```

### **Error Recovery**

```javascript
// Detect Firebase blocks
if (firebaseError.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
  await EmailVerificationTracker.recordFirebaseBlock();
  // Block user for 1+ hours
}
```

## Development & Testing

### **Clear Rate Limits (Development Only)**

```javascript
// Clear all stored rate limits
await clearEmailVerificationBlocks();
```

### **Testing Different Scenarios**

1. **Normal flow:** Test with fresh user
2. **Rate limiting:** Test multiple rapid attempts
3. **Firebase blocks:** Intentionally trigger Firebase limits
4. **Recovery:** Test waiting periods and recovery

## Monitoring & Metrics

### **Key Metrics to Track:**

- Rate limit hits per day
- Firebase blocks encountered
- Time between user attempts
- Email delivery success rates
- User completion rates after rate limiting

### **Alert Thresholds:**

- More than 10 Firebase blocks per day
- Rate limit hit rate > 20%
- User complaints about email delivery

## Support Scenarios

### **Common User Issues:**

1. **"I'm not getting emails"**

   - Check spam folder
   - Verify email address spelling
   - Check domain restrictions

2. **"Resend button is disabled"**

   - Explain rate limiting
   - Show countdown timer
   - Suggest checking existing emails

3. **"Says too many attempts"**
   - Explain Firebase protection
   - Suggest waiting period
   - Offer alternative solutions

### **Escalation Path:**

1. User checks spam/inbox thoroughly
2. Wait for rate limit to expire
3. Try from different device/network
4. Contact technical support
5. Manual verification if needed

## Security Benefits

This rate limiting system provides multiple security benefits:

1. **Spam Prevention:** Prevents email flooding
2. **Cost Control:** Reduces Firebase usage costs
3. **User Protection:** Prevents account enumeration
4. **System Stability:** Reduces load on email infrastructure
5. **Compliance:** Meets anti-spam regulations

## Future Improvements

### **Potential Enhancements:**

1. **Backend tracking:** Server-side rate limit enforcement
2. **Alternative verification:** SMS backup options
3. **Intelligent retry:** Exponential backoff strategies
4. **User preferences:** Allow users to set email timing preferences
5. **Analytics integration:** Track and optimize email delivery rates

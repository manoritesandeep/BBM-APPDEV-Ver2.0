# Password Reset Troubleshooting Guide

This guide helps resolve common issues with the password reset functionality.

## Common Issues

### 1. useInsertionEffect Warning

**Error Message:**

```
Warning: useInsertionEffect must not schedule updates.
```

**Cause:** Toast component scheduling updates during render phase

**Solution:**
Fixed by updating the `useToast` hook in `components/UI/Toast.js`:

```javascript
// Fixed implementation
export function useToast() {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
    duration: 3000,
  });

  const showToast = React.useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ visible: true, message, type, duration });
    },
    []
  );

  const hideToast = React.useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const ToastComponent = React.useMemo(
    () => () =>
      (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onHide={hideToast}
        />
      ),
    [toast.visible, toast.message, toast.type, toast.duration, hideToast]
  );

  return { showToast, hideToast, ToastComponent };
}
```

### 2. Navigation Errors

**Error Message:**

```
Cannot navigate to 'EmailPasswordReset'
```

**Possible Causes:**

- Screen not registered in navigator
- Navigation prop not available
- Incorrect screen name

**Solutions:**

1. Verify screen registration in `navigation/AppNavigators.js`:

```javascript
<UserStack.Screen
  name="EmailPasswordReset"
  component={EmailPasswordReset}
  options={{
    title: "Reset Password",
    headerShown: false,
  }}
/>
```

2. Check navigation prop in component:

```javascript
function handleForgotPassword() {
  navigation.navigate("EmailPasswordReset");
}
```

### 3. Email Not Received

**Symptoms:**

- Success message shows but no email received
- User reports not receiving reset email

**Troubleshooting Steps:**

1. **Check Spam Folder**

   - Advise user to check spam/junk folder
   - Firebase emails may be filtered

2. **Verify Email in Firebase**

   - Go to Firebase Console → Authentication → Users
   - Confirm email exists and is verified

3. **Check Firebase Email Templates**

   - Go to Firebase Console → Authentication → Templates
   - Verify password reset template is enabled
   - Check email template content

4. **Test with Different Email Providers**
   - Try Gmail, Yahoo, Outlook
   - Some providers may block automated emails

### 4. API Errors

**Error Types and Solutions:**

#### EMAIL_NOT_FOUND

```
Error: No account found with this email address
```

**Solution:** User needs to create account first or use correct email

#### TOO_MANY_ATTEMPTS_TRY_LATER

```
Error: Too many password reset attempts
```

**Solution:**

- User must wait before trying again
- Firebase enforces rate limiting
- Typical wait time: 1 hour

#### INVALID_EMAIL

```
Error: Please enter a valid email address
```

**Solution:** Client-side validation should catch this, but server validates too

#### Network Timeout

```
Error: Request timed out
```

**Solution:**

- Check internet connection
- Verify Firebase endpoints are accessible
- Consider increasing timeout in code

### 5. Firebase Configuration Issues

**Symptoms:**

- API calls failing
- Authentication not working

**Check List:**

1. **Environment Variables**

   ```bash
   # Verify .env file contains:
   FIREBASE_API_KEY=your_key
   FIREBASE_AUTH_DOMAIN=your_domain
   FIREBASE_PROJECT_ID=your_project
   ```

2. **Firebase Console Settings**

   - Authentication enabled
   - Email/Password provider enabled
   - Authorized domains configured

3. **API Keys**
   - Keys not expired
   - Keys have correct permissions
   - Restrictive quotas not exceeded

### 6. UI/UX Issues

#### Toast Not Showing

**Possible Causes:**

- ToastProvider not wrapped correctly
- Multiple toast instances
- Z-index issues

**Solutions:**

1. Verify ToastProvider in App.js:

```javascript
<ToastProvider>{/* App content */}</ToastProvider>
```

2. Check component usage:

```javascript
const { showToast, ToastComponent } = useToast();
// Render ToastComponent in component
```

#### Loading State Not Working

**Check:**

- Loading state properly managed
- LoadingOverlay component imported correctly
- State updates not blocked

#### Keyboard Issues

**Solutions:**

- Use KeyboardAvoidingView
- Proper behavior prop for platform
- Correct keyboardVerticalOffset

### 7. Performance Issues

#### Slow API Responses

**Optimization:**

- Add request timeout
- Show loading indicators
- Implement retry logic

#### Memory Leaks

**Prevention:**

- Clean up timers in useEffect
- Proper component unmounting
- Remove event listeners

## Debugging Tools

### 1. Console Logging

Add debug logs in key areas:

```javascript
console.log("📤 Sending password reset email to:", email);
console.log("✅ Password reset email sent successfully");
console.log("❌ Failed to send password reset email:", error);
```

### 2. Network Debugging

- Use React Native Debugger
- Check Network tab in dev tools
- Verify API endpoints and payloads

### 3. Firebase Console

- Monitor authentication logs
- Check user management
- Review email delivery status

## Testing Strategy

### Manual Testing

1. **Happy Path**

   - Enter valid email
   - Verify success flow
   - Check email delivery

2. **Error Cases**

   - Invalid email format
   - Unregistered email
   - Rate limiting (multiple attempts)
   - Network issues

3. **UI Testing**
   - Different screen sizes
   - Keyboard interaction
   - Navigation flow

### Automated Testing

Consider implementing:

- Unit tests for API functions
- Integration tests for navigation
- E2E tests for complete flow

## Prevention Strategies

### 1. Input Validation

- Validate email format client-side
- Trim whitespace
- Prevent empty submissions

### 2. Error Handling

- Graceful error messages
- Fallback UI states
- Retry mechanisms

### 3. User Education

- Clear instructions
- Expected wait times
- Alternative contact methods

## Monitoring and Analytics

### Key Metrics to Track

- Password reset request rate
- Success/failure ratios
- Email delivery rates
- User completion rates

### Error Monitoring

- Implement crash reporting
- Track API failure rates
- Monitor Firebase quotas

## Emergency Procedures

### If Password Reset Completely Fails

1. **Immediate Actions**

   - Check Firebase status page
   - Verify API connectivity
   - Review recent configuration changes

2. **Fallback Options**

   - Provide support contact information
   - Manual password reset process
   - Alternative authentication methods

3. **Communication**
   - Update app status page
   - Notify users of issues
   - Provide timeline for resolution

---

**Last Updated:** August 29, 2025
**Emergency Contact:** Development Team
**Firebase Support:** https://firebase.google.com/support

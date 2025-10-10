# Phone Authentication - Troubleshooting Guide

## Common Issues and Solutions

### 1. OTP Not Received

#### Symptoms

- User enters phone number and clicks "Send OTP"
- Success message appears but no SMS is received
- User cannot proceed to verification step

#### Possible Causes & Solutions

**A. Phone Number Format Issues**

```javascript
// ❌ Wrong formats
"1234567890"; // Missing country code
"+1 (234) 567-8900"; // Contains formatting characters
"+1234567890x123"; // Contains extension

// ✅ Correct format
"+1234567890"; // Clean format with country code
```

**Solution:**

- Ensure phone number includes country code (+1, +44, +91, etc.)
- Remove all formatting (spaces, dashes, parentheses)
- Use the `formatPhoneNumber` utility function

**B. Firebase SMS Quota Exceeded**

```javascript
// Check in Firebase Console
Authentication > Usage > SMS usage
```

**Solution:**

- Check daily/monthly SMS limits in Firebase Console
- Upgrade Firebase plan if needed
- Implement rate limiting to prevent abuse

**C. Device SMS Blocking**

```javascript
// Android permissions in AndroidManifest.xml
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
```

**Solution:**

- Check device SMS permissions
- Verify SMS isn't blocked by carrier
- Try with different phone number
- Check spam/blocked messages folder

**D. Firebase Configuration Issues**

```javascript
// Verify Firebase config
import { getFirebaseDB } from "../util/firebaseConfig";

const testFirebaseConnection = async () => {
  try {
    const db = await getFirebaseDB();
    console.log("Firebase connected:", !!db);
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
};
```

**Solution:**

- Verify Firebase project configuration
- Check API keys are correct
- Ensure phone authentication is enabled in Firebase Console

### 2. Invalid Verification Code

#### Symptoms

- User receives OTP but verification fails
- Error message: "Invalid verification code"
- Cannot complete authentication

#### Possible Causes & Solutions

**A. Expired OTP**

```javascript
// OTP codes typically expire after 60 seconds
if (error.code === "auth/code-expired") {
  showToast("OTP has expired. Please request a new one", "error");
}
```

**Solution:**

- Request new OTP code
- Implement auto-refresh before expiration
- Add countdown timer for user awareness

**B. Incorrect Code Entry**

```javascript
// Validate OTP format before sending
const validateOTP = (code) => {
  return /^\d{6}$/.test(code);
};
```

**Solution:**

- Verify user entered 6-digit numeric code
- Clear any spaces or formatting
- Implement auto-submit when 6 digits entered

**C. Network Issues During Verification**

```javascript
// Handle network errors
try {
  await verifyCode(otp);
} catch (error) {
  if (error.code === "auth/network-request-failed") {
    showToast("Network error. Please check connection and try again", "error");
  }
}
```

**Solution:**

- Check internet connectivity
- Retry verification
- Implement offline state handling

### 3. Authentication Context Issues

#### Symptoms

- Phone authentication succeeds but user isn't logged in
- App doesn't recognize authenticated state
- Navigation doesn't redirect to main app

#### Possible Causes & Solutions

**A. Auth Context Not Updated**

```javascript
// Ensure auth context is properly set
const { authenticate } = useContext(AuthContext);

const handlePhoneAuthSuccess = async (userCredential) => {
  const token = await userCredential.user.getIdToken();
  const userId = userCredential.user.uid;

  // Must call authenticate to update context
  authenticate(token, userId, "phone");
};
```

**Solution:**

- Verify `authenticate()` is called after successful verification
- Check AuthContext is properly provided in app root
- Ensure token and userId are correctly extracted

**B. User Profile Not Created**

```javascript
// Check if user document exists in Firestore
const checkUserProfile = async (userId) => {
  const db = await getFirebaseDB();
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    console.error("User profile not found");
  }
};
```

**Solution:**

- Verify Firestore user document is created
- Check Firestore security rules allow user creation
- Ensure proper error handling in user creation flow

### 4. Firebase Connection Issues

#### Symptoms

- Authentication requests fail silently
- Console shows Firebase-related errors
- Network requests to Firebase time out

#### Possible Causes & Solutions

**A. Firebase Project Configuration**

```javascript
// Verify Firebase initialization
import auth from "@react-native-firebase/auth";

const testAuth = () => {
  const currentUser = auth().currentUser;
  console.log("Current user:", currentUser);
};
```

**Solution:**

- Check `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- Verify Firebase project ID matches configuration
- Ensure all required Firebase services are enabled

**B. Network Configuration**

```javascript
// Test network connectivity
const testNetwork = async () => {
  try {
    const response = await fetch("https://www.google.com");
    console.log("Network OK:", response.ok);
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

**Solution:**

- Check device internet connection
- Verify firewall/proxy settings
- Test with different network (cellular vs WiFi)

### 5. Rate Limiting Issues

#### Symptoms

- Error: "Too many requests. Try again later"
- OTP sending fails after multiple attempts
- Temporary authentication blocking

#### Possible Causes & Solutions

**A. Client-Side Rate Limiting**

```javascript
// Implement request throttling
const [lastRequestTime, setLastRequestTime] = useState(0);
const RATE_LIMIT_MS = 60000; // 1 minute

const canMakeRequest = () => {
  const now = Date.now();
  return now - lastRequestTime > RATE_LIMIT_MS;
};

const sendOTPWithRateLimit = async (phoneNumber) => {
  if (!canMakeRequest()) {
    const waitTime = Math.ceil(
      (RATE_LIMIT_MS - (Date.now() - lastRequestTime)) / 1000
    );
    showToast(
      `Please wait ${waitTime} seconds before requesting another OTP`,
      "error"
    );
    return;
  }

  setLastRequestTime(Date.now());
  await sendVerificationCode(phoneNumber);
};
```

**Solution:**

- Implement client-side cooldown periods
- Show countdown timer to user
- Add visual feedback for rate limiting

**B. Firebase Rate Limits**

```javascript
// Handle Firebase rate limiting
const handleRateLimit = (error) => {
  if (error.code === "auth/too-many-requests") {
    showToast("Too many attempts. Please try again in a few minutes", "error");
    // Disable controls temporarily
    setControlsDisabled(true);
    setTimeout(() => setControlsDisabled(false), 300000); // 5 minutes
  }
};
```

**Solution:**

- Wait for Firebase cooldown period
- Use test phone numbers during development
- Monitor usage in Firebase Console

### 6. UI/UX Issues

#### Symptoms

- Loading states not showing
- Error messages not displaying
- Navigation doesn't work properly

#### Possible Causes & Solutions

**A. Loading State Management**

```javascript
// Ensure loading states are properly managed
const [isLoading, setIsLoading] = useState(false);

const sendOTP = async () => {
  setIsLoading(true);
  try {
    await sendVerificationCode(phoneNumber);
  } catch (error) {
    showError(error.message);
  } finally {
    setIsLoading(false); // Always reset loading state
  }
};
```

**Solution:**

- Always use try/finally blocks for loading states
- Implement proper error boundaries
- Test all user interaction paths

**B. Toast/Error Message Issues**

```javascript
// Verify toast system is working
import { useToast } from "../components/UI/Toast";

const { showToast, ToastComponent } = useToast();

// Ensure ToastComponent is rendered
return (
  <View>
    <ToastComponent />
    {/* Other components */}
  </View>
);
```

**Solution:**

- Ensure Toast component is properly rendered
- Verify toast context is provided
- Check z-index and positioning for toast visibility

### 7. Development vs Production Issues

#### Symptoms

- Works in development but fails in production
- Different behavior in release builds
- Platform-specific issues

#### Possible Causes & Solutions

**A. Test vs Production Configuration**

```javascript
// Different configs for development/production
const getFirebaseConfig = () => {
  if (__DEV__) {
    return {
      // Development config with test phone numbers
      testPhoneNumbers: {
        "+15555555555": "123456",
      },
    };
  } else {
    return {
      // Production config
    };
  }
};
```

**Solution:**

- Remove test phone number configuration in production
- Verify Firebase project settings for production
- Test with real phone numbers before release

**B. Platform-Specific Issues**

```javascript
// Handle platform differences
import { Platform } from "react-native";

const handleOTPVerification = async () => {
  if (Platform.OS === "ios") {
    // iOS-specific handling
  } else {
    // Android-specific handling
  }
};
```

**Solution:**

- Test on both iOS and Android
- Check platform-specific permissions
- Verify native dependencies are properly installed

## Debug Tools

### 1. Enable Debug Logging

```javascript
// Add to your app initialization
if (__DEV__) {
  // Enable Firebase debug logging
  console.log("Firebase debug mode enabled");
}

// Add debug statements to phone auth flow
const debugSendOTP = async (phoneNumber) => {
  console.log("📱 Sending OTP to:", phoneNumber);
  console.log("📱 Phone number valid:", validatePhoneNumber(phoneNumber));

  try {
    const result = await sendVerificationCode(phoneNumber);
    console.log("✅ OTP sent successfully:", result);
  } catch (error) {
    console.error("❌ OTP send failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
};
```

### 2. Network Debugging

```javascript
// Monitor network requests
const originalFetch = global.fetch;
global.fetch = (...args) => {
  console.log("🌐 Fetch request:", args[0]);
  return originalFetch(...args)
    .then((response) => {
      console.log("🌐 Fetch response:", response.status);
      return response;
    })
    .catch((error) => {
      console.error("🌐 Fetch error:", error);
      throw error;
    });
};
```

### 3. State Debugging

```javascript
// Debug authentication state
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";

const DebugAuthState = () => {
  const authCtx = useContext(AuthContext);

  console.log("Auth State Debug:", {
    isAuthenticated: authCtx.isAuthenticated,
    token: authCtx.token ? "Present" : "Missing",
    userId: authCtx.userId,
    provider: authCtx.authProvider,
  });

  return null;
};
```

## Getting Help

### 1. Check Firebase Console

- Go to Firebase Console → Authentication → Users
- Check if user was created during phone auth
- Verify authentication provider is listed as "phone"

### 2. Check Device Logs

```bash
# Android
adb logcat | grep -i firebase

# iOS
xcrun simctl spawn booted log stream --predicate 'subsystem contains "firebase"'
```

### 3. Test with Known Working Numbers

Use Firebase test phone numbers during development:

- +1 555-555-5555 → OTP: 123456

### 4. Verify Dependencies

```bash
# Check React Native Firebase installation
npx react-native info

# Verify Firebase packages
npm list @react-native-firebase/app
npm list @react-native-firebase/auth
```

### 5. Common Commands for Debugging

```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx react-native run-android

# For iOS
cd ios && rm -rf build && cd ..
npx react-native run-ios
```

## Prevention Tips

1. **Always Test with Real Devices**: Simulators may not handle SMS properly
2. **Implement Proper Error Boundaries**: Catch and handle all possible errors
3. **Use Test Phone Numbers in Development**: Avoid SMS charges and rate limits
4. **Monitor Firebase Usage**: Keep track of SMS quota and costs
5. **Implement Analytics**: Track authentication success/failure rates
6. **Regular Security Audits**: Review authentication flow for vulnerabilities
7. **User Feedback Collection**: Allow users to report authentication issues

## When to Contact Support

Contact Firebase Support or your team if:

- Multiple users report the same authentication issue
- Firebase quotas are unexpectedly exceeded
- Authentication works in development but fails in production
- Security concerns are identified
- Rate limiting affects legitimate users

Remember to provide:

- Error codes and messages
- Device and platform information
- Steps to reproduce the issue
- Firebase project ID (if appropriate)
- User phone number patterns (without exposing actual numbers)

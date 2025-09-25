# Phone Authentication - Implementation Guide

## Quick Start

### 1. Import Components

```javascript
import { PhoneSignInButton } from "../components/Auth/providers/Phone/components";
import { usePhoneAuth } from "../components/Auth/providers/Phone/hooks/usePhoneAuth";
```

### 2. Basic Usage

```javascript
function MyAuthScreen() {
  const { isLoading, sendVerificationCode, verifyCode, validatePhoneNumber } =
    usePhoneAuth();

  const handlePhoneAuth = async (phoneNumber) => {
    if (validatePhoneNumber(phoneNumber)) {
      await sendVerificationCode(phoneNumber);
    }
  };

  return (
    <PhoneSignInButton
      onPress={() => handlePhoneAuth("+1234567890")}
      isLogin={true}
    />
  );
}
```

## API Reference

### usePhoneAuth Hook

#### Methods

```javascript
// Send OTP to phone number
await sendVerificationCode(phoneNumber: string): Promise<{success: boolean, message: string}>

// Verify OTP code
await verifyCode(
  verificationCode: string,
  isSignUp: boolean = false,
  additionalData: object = {}
): Promise<{success: boolean, isNewUser: boolean, userData: object, message: string}>

// Resend OTP
await resendVerificationCode(phoneNumber: string): Promise<{success: boolean, message: string}>

// Validate phone number format
validatePhoneNumber(phoneNumber: string): boolean

// Format phone number
formatPhoneNumber(phoneNumber: string): string

// Reset authentication state
resetPhoneAuth(): void
```

#### State

```javascript
const {
  isLoading: boolean, // Loading state for any operation
  verificationInProgress: boolean, // Whether OTP has been sent
} = usePhoneAuth();
```

### PhoneAuthScreen Component

#### Props

```javascript
<PhoneAuthScreen
  isSignUp={boolean}           // Whether this is signup (true) or login (false)
  onSuccess={function}         // Called when authentication succeeds
  onBack={function}           // Called when user wants to go back
  initialData={object}        // Additional data for new user creation
/>
```

#### Success Callback Data

```javascript
onSuccess({
  success: true,
  isNewUser: boolean, // true if new account was created
  userData: {
    userId: string,
    phoneNumber: string,
    displayName: string,
    // ... other user data
  },
  message: string,
});
```

### PhoneSignInButton Component

#### Props

```javascript
<PhoneSignInButton
  onPress={function}          // Called when button is pressed
  isLogin={boolean}           // Whether this is for login (true) or signup (false)
  disabled={boolean}          // Whether button is disabled
  style={object}              // Additional styles
/>
```

## Integration Examples

### 1. Basic Phone Authentication

```javascript
import React, { useState } from "react";
import { View, Alert } from "react-native";
import { PhoneAuthScreen } from "../components/Auth/providers/Phone/components";

function BasicPhoneAuth() {
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const handleSuccess = (result) => {
    Alert.alert("Success", result.message);
    setShowPhoneAuth(false);
    // Navigate to main app
  };

  const handleBack = () => {
    setShowPhoneAuth(false);
  };

  if (showPhoneAuth) {
    return (
      <PhoneAuthScreen
        isSignUp={false}
        onSuccess={handleSuccess}
        onBack={handleBack}
      />
    );
  }

  return (
    <View>
      <PhoneSignInButton
        onPress={() => setShowPhoneAuth(true)}
        isLogin={true}
      />
    </View>
  );
}
```

### 2. Phone Auth with User Data Collection

```javascript
import React, { useState } from "react";
import { PhoneAuthScreen } from "../components/Auth/providers/Phone/components";

function PhoneAuthWithUserData() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleSuccess = (result) => {
    console.log("New user created:", result.userData);
    // Handle successful authentication
  };

  return (
    <PhoneAuthScreen
      isSignUp={true}
      onSuccess={handleSuccess}
      onBack={() => console.log("Back pressed")}
      initialData={userData}
    />
  );
}
```

### 3. Custom Phone Auth Flow

```javascript
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { usePhoneAuth } from "../components/Auth/providers/Phone/hooks/usePhoneAuth";

function CustomPhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'

  const { isLoading, sendVerificationCode, verifyCode, validatePhoneNumber } =
    usePhoneAuth();

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    try {
      const result = await sendVerificationCode(phoneNumber);
      Alert.alert("Success", result.message);
      setStep("otp");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await verifyCode(otp, false); // false = login
      Alert.alert("Success", result.message);
      // Handle successful authentication
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {step === "phone" ? (
        <>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number (+1234567890)"
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={handleSendOTP} disabled={isLoading}>
            <Text>{isLoading ? "Sending..." : "Send OTP"}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity onPress={handleVerifyOTP} disabled={isLoading}>
            <Text>{isLoading ? "Verifying..." : "Verify OTP"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
```

## Error Handling

### Common Error Patterns

```javascript
import { usePhoneAuth } from "../hooks/usePhoneAuth";
import { useToast } from "../components/UI/Toast";

function PhoneAuthWithErrorHandling() {
  const { sendVerificationCode, verifyCode } = usePhoneAuth();
  const { showToast } = useToast();

  const handleSendOTP = async (phoneNumber) => {
    try {
      await sendVerificationCode(phoneNumber);
      showToast("OTP sent successfully", "success");
    } catch (error) {
      // Handle specific errors
      switch (error.message) {
        case "Please enter a valid phone number with country code (e.g., +1234567890)":
          showToast("Invalid phone number format", "error");
          break;
        case "Too many requests. Please try again later":
          showToast("Please wait before requesting another OTP", "error");
          break;
        case "SMS quota exceeded. Please try again tomorrow":
          showToast("SMS limit reached. Try again tomorrow", "error");
          break;
        default:
          showToast("Failed to send OTP. Please try again", "error");
      }
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const result = await verifyCode(otp, false);
      showToast(result.message, "success");
    } catch (error) {
      if (error.message.includes("Invalid verification code")) {
        showToast("Please check the OTP and try again", "error");
      } else if (error.message.includes("expired")) {
        showToast("OTP has expired. Please request a new one", "error");
      } else {
        showToast("Verification failed. Please try again", "error");
      }
    }
  };
}
```

## Testing

### Test Phone Numbers (Development)

Configure these in Firebase Console for testing:

```javascript
// Test numbers for development
const TEST_NUMBERS = {
  "+15555555555": "123456", // US number
  "+447700900000": "654321", // UK number
  "+919876543210": "111111", // India number
};
```

### Unit Tests

```javascript
import { renderHook, act } from "@testing-library/react-hooks";
import { usePhoneAuth } from "../hooks/usePhoneAuth";

describe("usePhoneAuth", () => {
  test("validates phone numbers correctly", () => {
    const { result } = renderHook(() => usePhoneAuth());

    expect(result.current.validatePhoneNumber("+1234567890")).toBe(true);
    expect(result.current.validatePhoneNumber("1234567890")).toBe(false);
    expect(result.current.validatePhoneNumber("+1")).toBe(false);
  });

  test("formats phone numbers correctly", () => {
    const { result } = renderHook(() => usePhoneAuth());

    expect(result.current.formatPhoneNumber("+1 (234) 567-8900")).toBe(
      "+12345678900"
    );
    expect(result.current.formatPhoneNumber("1234567890")).toBe("1234567890");
  });
});
```

## Configuration

### Firebase Setup

1. **Enable Phone Authentication**

   ```javascript
   // In Firebase Console
   Authentication > Sign-in method > Phone > Enable
   ```

2. **Configure Test Numbers**

   ```javascript
   // In Firebase Console
   Authentication > Sign-in method > Phone > Add test phone number
   ```

3. **Set SMS Quota**
   ```javascript
   // In Firebase Console
   Authentication > Usage > Set SMS quota limits
   ```

### App Configuration

1. **Update Firebase Config**

   ```javascript
   // firebaseConfig.js
   import { initializeApp } from "@react-native-firebase/app";

   const firebaseConfig = {
     // Your Firebase config
   };

   initializeApp(firebaseConfig);
   ```

2. **Add Permissions (Android)**
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.RECEIVE_SMS" />
   <uses-permission android:name="android.permission.READ_SMS" />
   ```

## Best Practices

### 1. Phone Number Validation

```javascript
// Always validate before sending OTP
const isValid = validatePhoneNumber(phoneNumber);
if (!isValid) {
  showError("Please enter a valid phone number with country code");
  return;
}
```

### 2. Rate Limiting

```javascript
// Implement client-side rate limiting
const [lastOTPTime, setLastOTPTime] = useState(0);
const OTP_COOLDOWN = 60000; // 60 seconds

const canSendOTP = () => {
  return Date.now() - lastOTPTime > OTP_COOLDOWN;
};
```

### 3. User Feedback

```javascript
// Always provide clear feedback
try {
  await sendVerificationCode(phoneNumber);
  showToast("Verification code sent to your phone", "success");
} catch (error) {
  showToast(error.message, "error");
}
```

### 4. Accessibility

```javascript
<TextInput
  accessibilityLabel="Phone number input"
  accessibilityHint="Enter your phone number with country code"
  autoCompleteType="tel"
  textContentType="telephoneNumber"
  keyboardType="phone-pad"
/>
```

## Troubleshooting

### Common Issues

1. **OTP Not Received**

   - Check phone number format includes country code
   - Verify Firebase SMS quota not exceeded
   - Check device SMS permissions

2. **Invalid Phone Number**

   - Ensure country code is included (+1, +44, etc.)
   - Remove spaces, dashes, parentheses
   - Validate format with regex

3. **Firebase Errors**
   - Check Firebase project configuration
   - Verify authentication is enabled
   - Check API keys and permissions

### Debug Logging

```javascript
// Enable debug logging
import { usePhoneAuth } from "../hooks/usePhoneAuth";

const { sendVerificationCode } = usePhoneAuth();

const debugSendOTP = async (phoneNumber) => {
  console.log("Sending OTP to:", phoneNumber);
  try {
    const result = await sendVerificationCode(phoneNumber);
    console.log("OTP sent successfully:", result);
  } catch (error) {
    console.error("OTP send failed:", error);
  }
};
```

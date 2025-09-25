# Phone Authentication Module

This directory contains the complete phone authentication implementation for Build Bharat Mart.

## Directory Structure

```
Phone/
├── PhoneAuth.js                    # Main component entry point
├── GetOTP.js                      # Legacy component (for backward compatibility)
├── components/
│   ├── PhoneAuthScreen.js         # Main authentication UI screen
│   ├── PhoneSignInButton.js       # Phone sign-in button component
│   └── index.js                   # Component exports
├── hooks/
│   └── usePhoneAuth.js           # Authentication logic hook
└── utils/
    └── phoneUtils.js             # Phone number utilities and validation
```

## Quick Start

### Basic Usage

```javascript
import PhoneAuth from "./PhoneAuth";

function MyAuthScreen() {
  return (
    <PhoneAuth
      isSignUp={false}
      onSuccess={(result) => console.log("Auth success:", result)}
      onBack={() => console.log("User went back")}
    />
  );
}
```

### Using the Hook

```javascript
import { usePhoneAuth } from "./hooks/usePhoneAuth";

function CustomPhoneAuth() {
  const { sendVerificationCode, verifyCode, isLoading } = usePhoneAuth();

  // Your custom implementation
}
```

### Using Utilities

```javascript
import { validatePhoneNumber, formatPhoneNumber } from "./utils/phoneUtils";

const isValid = validatePhoneNumber("+1234567890"); // true
const formatted = formatPhoneNumber("+1 (234) 567-8900"); // +12345678900
```

## Components

### PhoneAuth

Main component that provides complete phone authentication flow.

**Props:**

- `isSignUp` (boolean): Whether this is signup or login
- `onSuccess` (function): Called when authentication succeeds
- `onBack` (function): Called when user wants to go back
- `initialData` (object): Additional data for new user creation

### PhoneAuthScreen

The UI component that handles the authentication flow.

### PhoneSignInButton

A styled button component for initiating phone authentication.

## Hooks

### usePhoneAuth

Custom hook that provides all phone authentication functionality.

**Returns:**

- `isLoading`: Loading state
- `verificationInProgress`: Whether OTP was sent
- `sendVerificationCode`: Function to send OTP
- `verifyCode`: Function to verify OTP
- `resendVerificationCode`: Function to resend OTP
- `resetPhoneAuth`: Function to reset state
- `validatePhoneNumber`: Function to validate phone numbers
- `formatPhoneNumber`: Function to format phone numbers

## Utilities

### phoneUtils.js

Comprehensive phone number utilities including:

- Validation functions
- Formatting functions
- Country code detection
- Display formatting
- Privacy masking

## Features

- ✅ Complete phone authentication flow
- ✅ Real-time phone number validation
- ✅ OTP sending and verification
- ✅ Automatic user profile creation
- ✅ Error handling and recovery
- ✅ Loading states and visual feedback
- ✅ Accessibility support
- ✅ International phone number support
- ✅ Resend OTP functionality
- ✅ Firebase integration
- ✅ Secure token handling

## Integration

This module integrates seamlessly with:

- Firebase Authentication
- Firebase Firestore
- React Navigation
- Build Bharat Mart's existing auth system
- Theme and styling system
- Localization system

## Documentation

For detailed documentation, see:

- [README.md](../../../docs/auth/login/phone/README.md) - Complete overview
- [IMPLEMENTATION.md](../../../docs/auth/login/phone/IMPLEMENTATION.md) - Technical guide
- [TROUBLESHOOTING.md](../../../docs/auth/login/phone/TROUBLESHOOTING.md) - Problem solving
- [SUMMARY.md](../../../docs/auth/login/phone/SUMMARY.md) - Project summary

## Support

For issues or questions:

1. Check the troubleshooting guide
2. Review the implementation documentation
3. Verify Firebase configuration
4. Test with Firebase test phone numbers during development

## License

Part of Build Bharat Mart - Internal use only.

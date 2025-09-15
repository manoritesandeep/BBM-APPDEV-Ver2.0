# Apple Authentication Component

## Overview

The Apple authentication component provides a complete Apple Sign-In integration for Build Bharat Mart, following the same modular architecture as the Google and Facebook authentication implementations. This component enables users to sign in using their Apple ID with seamless Firebase Authentication integration.

## Structure

```
Apple/
├── AppleAuth.js               # Main component
├── hooks/
│   └── useAppleAuth.js        # Custom hook for Apple Auth logic
├── components/
│   ├── index.js               # Component exports
│   ├── AppleSignInButton.js   # Apple Sign-In button component
│   ├── ErrorDisplay.js        # Error handling component
│   └── AuthActions.js         # Authentication actions component
├── config/
│   └── constants.js           # Configuration constants
├── utils/
│   └── appleAuthUtils.js      # Apple utility functions
└── README.md                  # This file
```

## Features

- **Official Apple Sign-In Button**: Uses the official `AppleAuthentication.AppleAuthenticationButton`
- **Firebase Integration**: Seamlessly integrates with Firebase Authentication using OAuthProvider
- **User Profile Management**: Automatically retrieves and manages user profiles
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error handling for authentication failures
- **Loading States**: Proper loading indicators during authentication
- **Credential Management**: Secure credential storage and refresh capabilities
- **Token Validation**: JWT decoding and validation for Apple identity tokens

## Components

### AppleAuth.js (Main Component)

The main component that orchestrates the Apple authentication flow using the custom hook and sub-components.

### useAppleAuth (Custom Hook)

A custom hook that handles:

- Apple Sign-In availability checking
- Apple Sign-In logic with proper scopes
- User profile extraction from Apple credentials
- Credential storage and retrieval
- Credential refresh and state checking
- Sign-out logic
- Loading states
- Error handling

### AppleSignInButton

A wrapper component for the Apple Authentication Button with:

- Responsive design based on screen width
- Loading state support
- Availability checking
- Modern styling consistent with other social buttons

### ErrorDisplay

Handles error display with proper styling and error message formatting.

### AuthActions

Handles authentication actions (sign-in/sign-out/refresh/check-state) with loading states and user information display.

## Usage

```javascript
import { AppleSignInButton } from "./components/Auth/providers/Apple/components";

// Use in your app
<AppleSignInButton
  onPress={handleAppleSignIn}
  isLoading={loading}
  isAvailable={appleAvailable}
/>;
```

## Configuration

Apple Sign-In configuration is handled through:

1. **app.config.js**: iOS bundle identifier configuration
2. **Apple Developer Portal**: Apple Sign-In capability setup
3. **Firebase Console**: Apple provider configuration

```javascript
// No additional configuration constants needed
// Apple Sign-In uses native iOS capabilities
```

## Dependencies

- `expo-apple-authentication`
- `jwt-decode`
- `expo-secure-store`
- `react-native`
- Firebase Authentication with OAuthProvider

## Integration with Build Bharat Mart

The Apple authentication is integrated into the main authentication flow via:

1. **SocialLoginContainer**: Displays the Apple sign-in button (iOS only)
2. **socialAuth.js**: Handles the Firebase integration with OAuthProvider
3. **AuthContext**: Manages authentication state with "apple" provider
4. **UserContext**: Manages user profile data

### Authentication Flow:

1. **User taps Apple Sign-In button**
2. **Apple authentication dialog appears**
3. **User authenticates with Face ID/Touch ID/Passcode**
4. **Apple identity token received**
5. **Firebase credential created with OAuthProvider**
6. **User authenticated with Firebase**
7. **User profile created/updated in Firestore**
8. **App context updated**
9. **User redirected to authenticated screens**

## User Data Handling

The implementation automatically populates user profiles with:

- **Name**: From Apple credential fullName (first login only)
- **Email**: From Apple credential email (if granted permission)
- **Apple ID**: From identity token subject
- **Provider Information**: Tracks authentication method as "apple"
- **Real User Status**: Apple's real user indicator
- **Email Verification**: From Apple identity token
- **No Profile Photo**: Apple doesn't provide profile photos

### Important Notes:

- **Name Data**: Apple only provides name on the first authentication
- **Email Privacy**: Users can choose to hide their email using Apple's email relay
- **No Profile Photos**: Apple Sign-In doesn't provide profile pictures

## Error Handling

Comprehensive error handling for:

- **Device Compatibility**: "Apple Sign-In is not available on this device"
- **User Cancellation**: "User cancelled the Apple login flow"
- **Authorization Failures**: "Apple authorization failed"
- **Invalid Credentials**: "Invalid Apple credentials"
- **Account Conflicts**: "Account already exists with different credentials"
- **Network Issues**: "Network error occurred during Apple login"
- **Firebase Configuration**: "Apple Sign-In is not enabled in Firebase"

## Security Considerations

1. **Token Validation**: Apple identity tokens are validated using JWT decoding
2. **Secure Storage**: Credentials are stored securely using Expo SecureStore
3. **Firebase Integration**: All authentication goes through Firebase for consistency
4. **Credential Refresh**: Automatic credential refresh capabilities
5. **State Checking**: Credential state validation for security

## Performance Features

- **Lazy Initialization**: Apple SDK is initialized only when needed
- **Credential Caching**: Secure local credential storage
- **Error Boundaries**: Proper error handling prevents app crashes
- **Loading States**: Non-blocking UI with proper loading indicators
- **Responsive Design**: Optimized for different screen sizes

## Testing

Test the implementation by:

1. **Device Compatibility**: Test on iOS devices and simulators
2. **New User Flow**: Verify profile creation in Firestore
3. **Existing User Flow**: Verify profile update with latest info
4. **Error Scenarios**: Test network failures, cancelled sign-ins
5. **Logout Flow**: Verify proper cleanup of sessions
6. **Credential Refresh**: Test credential refresh functionality
7. **Email Privacy**: Test with Apple's email relay feature

## Platform Support

- **iOS**: Full support with native Apple Sign-In
- **Android**: Not available (Apple Sign-In is iOS-only)
- **Web**: Limited support (requires web domain configuration)

## Firebase Configuration

To enable Apple Sign-In in Firebase:

1. **Firebase Console** → Authentication → Sign-in method
2. **Enable Apple provider**
3. **Configure your iOS app's bundle ID**
4. **Add Apple Developer Team ID**
5. **Add Apple Sign-In private key** (for backend verification)

## Apple Developer Configuration

1. **Apple Developer Portal** → Certificates, Identifiers & Profiles
2. **App ID Configuration** → Enable Sign In with Apple capability
3. **Generate Apple Sign-In key** (for Firebase backend)
4. **Configure domain association** (if using web)

## Future Enhancements

- Support for Apple Sign-In on web platforms
- Enhanced profile data synchronization
- Apple-specific privacy features integration
- Sign in with Apple for macOS apps

## Troubleshooting

### Common Issues

1. **Apple Sign-In Button Not Appearing**

   - Check if running on iOS device/simulator
   - Verify Apple Sign-In availability
   - Check console for import errors

2. **Authentication Fails**

   - Verify Firebase Apple provider is enabled
   - Check Apple Developer Portal configuration
   - Monitor network requests for API errors

3. **Profile Data Missing**

   - Remember: Apple only provides name on first sign-in
   - Check if user granted email permission
   - Verify identity token decoding

4. **Provider Not Showing in Profile**

   - Check AuthContext provider tracking
   - Verify UserProfileCard provider display logic
   - Check UserContext user data structure

### Debug Console Commands

Monitor these specific logs during testing:

```javascript
// Apple authentication flow
"🍎 Starting Apple Sign-In process...";
"✅ Apple sign-in successful, authenticating with Firebase...";
"✅ Firebase authentication successful";

// Error handling
"❌ Apple sign-in failed:";
"❌ Apple sign-out failed:";
```

## Compliance

This implementation follows Apple's Human Interface Guidelines and App Store Review Guidelines for Sign in with Apple, ensuring compliance with Apple's requirements for apps that offer other social sign-in options.

The Apple authentication implementation provides a secure, user-friendly experience that integrates perfectly with the existing Build Bharat Mart authentication system while respecting Apple's privacy-first approach.

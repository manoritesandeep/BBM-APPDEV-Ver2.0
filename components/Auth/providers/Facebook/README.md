# Facebook Authentication Component

## Overview

The Facebook authentication component provides a complete Facebook Sign-In integration for Build Bharat Mart, following the same modular architecture as the Google authentication implementation.

## Structure

```
Facebook/
├── FacebookAuth.js              # Main component
├── hooks/
│   └── useFacebookAuth.js       # Custom hook for Facebook Auth logic
├── components/
│   ├── index.js                 # Component exports
│   ├── FacebookSignInButton.js  # Facebook Sign-In button component
│   ├── ErrorDisplay.js          # Error handling component
│   └── AuthActions.js           # Authentication actions component
├── config/
│   └── constants.js             # Configuration constants
├── utils/
│   └── facebookAuthUtils.js     # Facebook utility functions
└── README.md                    # This file
```

## Features

- **Official Facebook LoginButton**: Uses the official Facebook SDK LoginButton
- **Firebase Integration**: Seamlessly integrates with Firebase Authentication
- **User Profile Management**: Automatically retrieves and manages user profiles
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error handling for authentication failures
- **Loading States**: Proper loading indicators during authentication

## Components

### FacebookAuth.js (Main Component)

The main component that orchestrates the Facebook authentication flow using the custom hook and sub-components.

### useFacebookAuth (Custom Hook)

A custom hook that handles:

- Facebook SDK initialization
- Facebook Sign-In logic
- User profile retrieval
- Sign-out logic
- Loading states
- Error handling

### FacebookSignInButton

A wrapper component for the Facebook LoginButton with:

- Responsive design based on screen width
- Loading state support
- Modern styling with shadows

### ErrorDisplay

Handles error display with proper styling and error message formatting.

### AuthActions

Handles authentication actions (sign-in/sign-out) with loading states.

## Usage

```javascript
import { FacebookSignInButton } from "./components/Auth/providers/Facebook/components";

// Use in your app
<FacebookSignInButton onPress={handleFacebookSignIn} isLoading={loading} />;
```

## Configuration

Update the `config/constants.js` file with your Facebook App credentials:

```javascript
export const FACEBOOK_AUTH_CONFIG = {
  appId: "your-facebook-app-id",
};
```

## Dependencies

- `react-native-fbsdk-next`
- `expo-tracking-transparency`
- `react-native`
- Firebase Authentication

## Integration with Build Bharat Mart

The Facebook authentication is integrated into the main authentication flow via:

1. **SocialLoginContainer**: Displays the Facebook sign-in button
2. **socialAuth.js**: Handles the Firebase integration
3. **AuthContext**: Manages authentication state
4. **UserContext**: Manages user profile data

## User Data Handling

The implementation automatically populates user profiles with:

- **Name**: From Facebook profile display name
- **Email**: From Facebook profile email (if granted permission)
- **Profile Photo**: From Facebook profile picture (large size)
- **Facebook ID**: For future reference
- **Provider Information**: Tracks authentication method as "facebook"

## Error Handling

Comprehensive error handling for:

- **Network Issues**: "Network error occurred during Facebook login"
- **User Cancellation**: "User cancelled the Facebook login flow"
- **Access Denied**: "Access denied for Facebook login"
- **Account Conflicts**: "Account already exists with different credentials"
- **Invalid Credentials**: "The Facebook credential is invalid or has expired"
- **Disabled Accounts**: "This user account has been disabled"

## Security Considerations

1. **Token Management**: Firebase ID tokens are securely managed
2. **Permission Scoping**: Only requests necessary permissions (public_profile, email)
3. **Credential Validation**: Facebook credentials are validated by Firebase
4. **Session Management**: Proper logout from both Facebook and Firebase
5. **Data Protection**: User data is stored securely in Firestore

## Performance Features

- **Lazy Initialization**: Facebook SDK is initialized only when needed
- **Image Optimization**: Profile photos are retrieved in optimized format
- **Error Boundaries**: Proper error handling prevents app crashes
- **Loading States**: Non-blocking UI with proper loading indicators

## Testing

Test the implementation by:

1. **New User Flow**: Verify profile creation in Firestore
2. **Existing User Flow**: Verify profile update with latest info
3. **Error Scenarios**: Test network failures, cancelled sign-ins
4. **Logout Flow**: Verify proper cleanup of sessions
5. **Profile Data**: Verify data matches Facebook account

## Future Enhancements

- Support for additional Facebook permissions
- Facebook sharing integration
- Enhanced profile data synchronization
- Facebook-specific features integration

## Troubleshooting

### Common Issues

1. **Facebook Login Button Not Working**

   - Check Facebook App ID configuration
   - Verify Facebook SDK initialization
   - Ensure proper permissions are requested

2. **Profile Data Not Loading**

   - Check Facebook Graph API permissions
   - Verify network connectivity
   - Monitor console logs for errors

3. **Firebase Integration Issues**
   - Verify Firebase configuration
   - Check Facebook provider is enabled in Firebase Console
   - Ensure Firebase Auth is properly initialized

The Facebook authentication implementation provides a seamless, secure, and user-friendly experience that integrates perfectly with the existing Build Bharat Mart authentication system.

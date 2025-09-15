# Google Authentication Component

This directory contains a refactored and modular Google Authentication implementation for React Native.

## Structure

```
Google/
├── GoogleAuth.js              # Main component
├── hooks/
│   └── useGoogleAuth.js       # Custom hook for Google Auth logic
├── components/
│   ├── index.js               # Component exports
│   ├── GoogleSignInButton.js  # Google Sign-In button component
│   ├── UserProfile.js         # User profile display component
│   ├── ErrorDisplay.js        # Error handling component
│   └── AuthActions.js         # Authentication actions component
├── config/
│   └── constants.js           # Configuration constants
└── README.md                  # This file
```

## Components

### GoogleAuth.js (Main Component)

The main component that orchestrates the Google authentication flow using the custom hook and sub-components.

### useGoogleAuth (Custom Hook)

A custom hook that handles:

- Google Sign-In configuration
- Sign-in logic
- Sign-out logic
- Loading states
- Error handling

### GoogleSignInButton

A wrapper component for the Google Sign-In button with loading state support.

### UserProfile

Displays user information including:

- Profile picture
- Name, email, and other user details
- Optional raw data display

### ErrorDisplay

Handles error display with proper styling and error message formatting.

### AuthActions

Handles authentication actions (sign-in/sign-out) with loading states.

## Usage

```javascript
import GoogleAuth from "./components/Auth/providers/Google/GoogleAuth";

// Use in your app
<GoogleAuth />;
```

## Configuration

Update the `config/constants.js` file with your Google OAuth credentials:

```javascript
export const GOOGLE_AUTH_CONFIG = {
  webClientId: "your-web-client-id",
  androidClientId: "your-android-client-id", // Optional
  iosClientId: "your-ios-client-id", // Optional
};
```

## Benefits of this Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the app
3. **Maintainability**: Easier to test and modify individual components
4. **Separation of Concerns**: Logic is separated from UI components
5. **Better Error Handling**: Centralized error display component
6. **Loading States**: Proper loading state management
7. **Configuration**: Centralized configuration management

## Dependencies

- `@react-native-google-signin/google-signin`
- `react-native`
- `expo-status-bar`

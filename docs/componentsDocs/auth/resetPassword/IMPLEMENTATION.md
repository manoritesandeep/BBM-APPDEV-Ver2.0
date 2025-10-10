# Password Reset Implementation Guide

This guide provides step-by-step instructions for implementing password reset functionality in the Build Bharat Mart app.

## Files Modified/Created

### 1. Core Implementation Files

#### `util/auth.js`

**Added Function:**

```javascript
export async function sendPasswordResetEmail(email)
```

**Purpose:** Sends password reset email via Firebase REST API
**Key Features:**

- Email validation
- Firebase error handling
- Network timeout management
- User-friendly error messages

#### `components/Auth/providers/EmailAuth/EmailPasswordReset.js`

**Purpose:** Complete password reset screen component
**Key Features:**

- Clean UI design
- Form validation
- Loading states
- Toast notifications
- Navigation handling

### 2. Updated Components

#### `components/Auth/AuthForm.js`

**Changes:**

- Added "Forgot Password?" link
- Only visible on login screen
- Proper styling and positioning

#### `components/Auth/AuthContent.js`

**Changes:**

- Added `onForgotPassword` prop
- Pass forgot password handler to AuthForm

#### `screens/UnifiedAuthScreen.js`

**Changes:**

- Added `handleForgotPassword` function
- Pass handler to AuthContent component

#### `components/Auth/providers/EmailAuth/EmailAuthProvider.js`

**Changes:**

- Added `handlePasswordReset` function
- Import `sendPasswordResetEmail`
- Return new function in hook

#### `navigation/AppNavigators.js`

**Changes:**

- Import EmailPasswordReset component
- Add new screen to UserStack navigator

## Step-by-Step Implementation

### Step 1: Create API Function

1. Open `util/auth.js`
2. Add the `sendPasswordResetEmail` function after the `login` function
3. Import required constants at the top

### Step 2: Create Password Reset Screen

1. Create new file: `components/Auth/providers/EmailAuth/EmailPasswordReset.js`
2. Implement complete screen component with:
   - Form handling
   - Validation
   - Loading states
   - Success/error handling

### Step 3: Update Authentication Forms

1. Update `AuthForm.js`:

   - Add forgot password link
   - Add prop for forgot password handler
   - Style the link appropriately

2. Update `AuthContent.js`:
   - Add new prop for forgot password
   - Pass prop to AuthForm

### Step 4: Update Main Auth Screen

1. Update `UnifiedAuthScreen.js`:
   - Add forgot password handler function
   - Pass handler to AuthContent

### Step 5: Update Auth Provider Hook

1. Update `EmailAuthProvider.js`:
   - Import new API function
   - Add password reset handler
   - Return new function in hook

### Step 6: Add Navigation

1. Update `AppNavigators.js`:
   - Import EmailPasswordReset component
   - Add screen to UserStack navigator
   - Configure screen options

## Code Examples

### API Function Implementation

```javascript
// In util/auth.js
export async function sendPasswordResetEmail(email) {
  const url = `${IDENTITY_BASE}/accounts:sendOobCode?key=${API_KEY}`;

  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    const requestData = {
      requestType: "PASSWORD_RESET",
      email: email,
    };

    const response = await axios.post(url, requestData, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    // Handle Firebase and network errors
    // ... error handling code
  }
}
```

### Screen Component Structure

```javascript
// In EmailPasswordReset.js
function EmailPasswordReset({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  async function handlePasswordReset() {
    // Validation and API call
  }

  return (
    <SafeAreaWrapper>
      <ToastComponent />
      <KeyboardAvoidingView>
        {/* Form and UI components */}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
```

### Navigation Integration

```javascript
// In AppNavigators.js
<UserStack.Screen
  name="EmailPasswordReset"
  component={EmailPasswordReset}
  options={{
    title: "Reset Password",
    headerShown: false,
  }}
/>
```

## Testing Checklist

- [ ] Can navigate to reset screen from login
- [ ] Email validation works correctly
- [ ] Loading states display properly
- [ ] Success messages appear
- [ ] Error handling works for various scenarios
- [ ] Navigation back to login works
- [ ] Toast notifications display correctly
- [ ] Screen is responsive on different devices

## Common Issues and Solutions

### Issue: Navigation not working

**Solution:** Ensure screen is properly registered in navigator and navigation prop is available

### Issue: API errors

**Solution:** Verify Firebase configuration and API keys

### Issue: Toast not showing

**Solution:** Check Toast provider setup and component mounting

### Issue: Email not received

**Solution:** Check Firebase console, spam folder, and email template configuration

## Deployment Considerations

1. **Environment Variables:** Ensure all Firebase config variables are set in production
2. **Error Monitoring:** Add error tracking for password reset failures
3. **Rate Limiting:** Monitor Firebase quotas and usage
4. **Email Templates:** Customize email templates in Firebase console for branding

## Security Notes

- Never expose API keys in client code
- Use environment variables for configuration
- Implement proper error handling without exposing sensitive information
- Follow Firebase security best practices
- Regularly update dependencies

---

**Implementation Time:** ~2-3 hours
**Complexity Level:** Medium
**Dependencies:** Firebase Auth, React Navigation

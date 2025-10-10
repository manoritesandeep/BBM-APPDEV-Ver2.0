# Guest Checkout Email Verification Fix

## Issue Description

When a user who is logged in but hasn't verified their email attempts to checkout, they were seeing an email verification popup that only offered two options:

1. Verify Now
2. Cancel

This prevented users from checking out as a guest, which should be an available option.

## Root Cause

The issue was occurring in **TWO locations**:

### 1. Cart Screen (Primary Issue)

In `components/CartComponents/CartScreenOutput.js`, when the user clicks the "Checkout" button, it calls `requireVerification()` from the `useEmailVerificationGuard` hook. This hook was showing the email verification popup **before** the user even reached the billing screen.

### 2. Billing Screen (Secondary Issue)

In `hooks/useBillingLogic.js`, when placing an order, it also checked for email verification but didn't provide a guest checkout option.

The verification logic was:

1. If user is authenticated → check if they can place orders
2. If they can't → show email verification popup with no guest option
3. This blocked authenticated-but-unverified users from proceeding

## Solution

Modified **both** the email verification guard and billing logic to provide three options when an authenticated but unverified user tries to checkout:

1. **Verify Now** - Navigate to email verification screen
2. **Checkout as Guest** / **Proceed as Guest** - Log out and continue with guest flow
3. **Cancel** - Close the dialog

### Changes Made

#### File 1: `hooks/useEmailVerificationGuard.js` ⭐ (PRIMARY FIX)

**Changes:**

1. Added `AuthContext` import to check authentication status
2. Updated `useEmailVerificationGuard` hook:

   - Allow unauthenticated users to proceed (guest flow)
   - For authenticated but unverified users, show 3-option alert
   - Include "Checkout as Guest" option with logout confirmation

3. Updated `withEmailVerification` HOC with same logic:
   - Allow unauthenticated users to proceed
   - For authenticated but unverified users, show 3-option alert
   - Include "Proceed as Guest" option with logout confirmation

**New Logic Flow:**

```javascript
const requireVerification = (featureName, callback) => {
  // 1. Not authenticated? Allow proceeding (guest checkout)
  if (!authCtx.isAuthenticated || !userCtx.user) {
    callback();
    return true;
  }

  // 2. Authenticated and verified? Allow proceeding
  if (PhoneUserEmailService.canPlaceOrders(userCtx.user)) {
    callback();
    return true;
  }

  // 3. Authenticated but unverified? Show 3-option alert
  Alert.alert(
    "Email Verification Required",
    "...verify your email or log out and checkout as a guest.",
    [
      { text: "Verify Now", ... },
      { text: "Checkout as Guest", onPress: logout + callback },
      { text: "Cancel", ... }
    ]
  );
  return false;
};
```

#### File 2: `hooks/useBillingLogic.js` (SECONDARY FIX)

Both `handlePlaceOrder()` and `handleDirectPayment()` functions were updated:

```javascript
if (!PhoneUserEmailService.canPlaceOrders(user)) {
  Alert.alert(
    "Email Verification Required",
    "To place orders with your account, please verify your email address or phone number. Alternatively, you can log out and checkout as a guest.",
    [
      {
        text: "Verify Now",
        onPress: () => {
          navigation.navigate("UserScreen", {
            screen: "EmailVerification",
            params: { userEmail: user.email },
          });
        },
      },
      {
        text: "Checkout as Guest",
        onPress: () => {
          Alert.alert(
            "Logout Required",
            "To checkout as guest, you need to log out first. Your cart items will be preserved. Do you want to continue?",
            [
              {
                text: "Yes, Logout",
                onPress: async () => {
                  await authCtx.logout();
                  setGuestModalVisible(true);
                },
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]
  );
  return;
}
```

## User Flow After Fix

### Scenario 1: Unverified user clicks "Checkout" from Cart

1. User clicks "Checkout" button in cart
2. `CartScreenOutput.js` calls `requireVerification()`
3. System detects user is authenticated but unverified
4. Alert appears with 3 options:
   - **Verify Now**: Takes user to email verification screen
   - **Checkout as Guest**:
     - Shows logout confirmation dialog
     - If confirmed, logs user out
     - Navigates to billing screen
     - Guest checkout modal appears
   - **Cancel**: Stays on cart screen

### Scenario 2: Unverified user reaches billing and clicks "Place Order"

1. User is on billing screen
2. User clicks "Place Order" or "Pay Now"
3. System detects user is authenticated but unverified
4. Alert appears with 3 options (same as above)

### Benefits

- ✅ Users are no longer blocked from completing their purchase
- ✅ Clear path for guest checkout even if logged in
- ✅ Cart preservation during logout ensures no items are lost
- ✅ Maintains security by still encouraging email verification
- ✅ Fixes issue at the earliest point (cart screen) and backup at billing
- ✅ Consistent experience across all checkout entry points

## Testing Recommendations

### Test Case 1: Cart Screen Checkout Flow

1. Login with unverified email
2. Add items to cart
3. Click "Checkout" button
4. **Verify**: Alert shows 3 options
5. **Test**: Select "Checkout as Guest"
6. **Verify**: Logout confirmation appears
7. **Confirm**: Logout
8. **Verify**: Navigate to billing screen
9. **Verify**: Guest checkout modal appears
10. **Complete**: Guest checkout

### Test Case 2: Verify Now Flow

1. Login with unverified email
2. Add items to cart
3. Click "Checkout"
4. **Select**: "Verify Now"
5. **Verify**: Navigate to email verification screen
6. **Complete**: Email verification
7. **Return**: Back to cart
8. **Try**: Checkout again
9. **Verify**: Should proceed without popup

### Test Case 3: Billing Screen COD Order

1. Login with unverified email
2. Add items to cart
3. Somehow reach billing screen (if possible)
4. Try to place COD order
5. **Verify**: Alert with 3 options appears
6. **Test**: "Checkout as Guest" option

### Test Case 4: Billing Screen Razorpay Order

1. Login with unverified email
2. Add items to cart
3. Select Razorpay payment
4. Try to pay
5. **Verify**: Alert with 3 options appears

### Test Case 5: Guest User Flow (Baseline)

1. **Don't login** (guest user)
2. Add items to cart
3. Click "Checkout"
4. **Verify**: No email verification popup
5. **Verify**: Direct navigation to billing
6. **Verify**: Guest modal appears

### Test Case 6: Verified User Flow (Baseline)

1. Login with **verified** email/phone
2. Add items to cart
3. Click "Checkout"
4. **Verify**: No popup
5. **Verify**: Direct navigation to billing
6. **Proceed**: Normal checkout

### Test Case 7: Cart Preservation

1. Login with unverified email
2. Add specific items to cart (note them)
3. Click "Checkout"
4. Select "Checkout as Guest"
5. Confirm logout
6. **Verify**: Same cart items still present
7. **Complete**: Guest checkout with those items

## Related Files

- `/hooks/useEmailVerificationGuard.js` - **PRIMARY FIX** - Email verification guard
- `/hooks/useBillingLogic.js` - **SECONDARY FIX** - Billing logic
- `/components/CartComponents/CartScreenOutput.js` - Cart screen using verification guard
- `/components/Auth/providers/Phone/services/PhoneUserEmailService.js` - Verification logic
- `/store/auth-context.js` - Authentication context
- `/screens/BillingScreen.js` - Billing screen UI

## Date

October 10, 2025

## Notes

- The primary fix is in `useEmailVerificationGuard.js` as this is where the popup first appears
- The secondary fix in `useBillingLogic.js` provides a safety net if the user somehow bypasses the cart verification
- Both HOC (`withEmailVerification`) and hook (`useEmailVerificationGuard`) were updated for consistency
- Guest users (not logged in) are allowed to proceed without any popup
- Verified users proceed normally without any popup
- Only authenticated-but-unverified users see the 3-option popup

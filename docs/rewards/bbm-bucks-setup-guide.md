# BBM Bucks Setup Guide

## Overview

The BBM Bucks reward system has been fully implemented with the following components:

### Core Files Created/Modified:

1. **util/bbmBucksService.js** - Core business logic and Firebase operations
2. **store/bbm-bucks-context.js** - React Context for state management
3. **components/MenuComponents/BBMBucksUserDetails/** - Menu integration components
4. **components/BillingComponents/BBMBucks/** - Billing screen components
5. **hooks/useBillingLogic.js** - Updated with BBM Bucks functionality
6. **screens/BillingScreen.js** - Updated to include BBM Bucks UI
7. **util/bbmBucksInit.js** - Initialization helpers

## Setup Instructions

### 1. Firebase Firestore Indexes

**IMPORTANT**: You must create these indexes in Firebase Console before the system works properly:

#### Index 1: user_bbm_balance collection

- Collection ID: `user_bbm_balance`
- Fields: None required (single field queries only)

#### Index 2: bbm_bucks_transactions collection

- Collection ID: `bbm_bucks_transactions`
- Fields to index:
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### Index 3: bbm_bucks_transactions collection (complex queries)

- Collection ID: `bbm_bucks_transactions`
- Fields to index:
  - `userId` (Ascending)
  - `type` (Ascending)
  - `status` (Ascending)
  - `expiryDate` (Ascending)

**How to create indexes:**

1. Go to Firebase Console
2. Select your project
3. Go to Firestore Database
4. Click on "Indexes" tab
5. Click "Create Index"
6. Add the fields as specified above

### 2. Initialize Collections

Run this command in your app console (browser dev tools):

```javascript
// After user login, initialize their BBM Bucks account
import { initializeBBMBucksForUser } from "./util/bbmBucksInit";

// Replace 'actual_user_id' with the logged-in user's Firebase Auth ID
await initializeBBMBucksForUser("actual_user_id");
```

### 3. Test the System

```javascript
// Test the BBM Bucks system
import { testBBMBucksSystem } from "./util/bbmBucksInit";

await testBBMBucksSystem("actual_user_id");
```

## Menu Integration

The BBM Bucks menu item has been added to the menu system:

### MenuScreen.js Updated:

- Added BBM Bucks menu item with ID 8
- Added navigation to BBMBucksUserDetails component
- Handles both authenticated and unauthenticated users

### Menu Item Structure:

```javascript
{
  id: 8,
  title: "BBM Bucks",
  icon: "💰",
  description: "Reward points and cashback",
  route: "bbmBucks"
}
```

## Billing Screen Integration

### Features Added:

1. **BBMBucksRedemption Component**: Allows users to redeem BBM Bucks for discounts
2. **BBMBucksRewardDisplay Component**: Shows potential earnings from current order
3. **BillDetails Updated**: Displays BBM Bucks discount in order summary
4. **useBillingLogic Enhanced**: Handles BBM Bucks state and operations

### Billing Flow:

1. User sees their BBM Bucks balance
2. Can choose to redeem BBM Bucks for discount (up to 50% of order value)
3. Order total recalculated with BBM Bucks discount
4. Upon order completion, BBM Bucks are deducted and new rewards awarded

## Order Processing Integration

### Payment Success Flow:

1. **Online Payments**: BBM Bucks processed in `handlePaymentSuccess`
2. **COD Orders**: BBM Bucks processed in `handlePlaceOrder`

### Operations:

1. **Redemption**: Deduct redeemed BBM Bucks from user balance
2. **Rewards**: Award new BBM Bucks based on order amount and tier
3. **Balance Refresh**: Update context with new balance

## Reward Tiers

### Standard Tier (Default)

- **Rate**: 1% back in BBM Bucks
- **Requirement**: All new users

### Premium Tier

- **Rate**: 1.5% back in BBM Bucks
- **Requirement**: ₹25,000+ lifetime earnings

### Elite Tier

- **Rate**: 2% back in BBM Bucks
- **Requirement**: ₹50,000+ lifetime earnings

## Business Rules

### Earning BBM Bucks:

- 1 BBM Buck = ₹1 in discount value
- Earned on all orders except excluded categories
- Conversion rate: 100 BBM Bucks = ₹1 discount

### Redeeming BBM Bucks:

- Minimum redemption: 5000 BBM Bucks (₹50)
- Maximum: 50% of order value
- Cannot be combined with certain promotions

### Excluded Categories:

- Gift cards
- Alcohol
- Tobacco

## Context Provider Setup

The app is already configured with BBMBucksContextProvider in App.js:

```javascript
<BBMBucksContextProvider>
  <CartContextProvider>{/* Other providers */}</CartContextProvider>
</BBMBucksContextProvider>
```

## Testing Checklist

### Pre-Testing:

- [ ] Firebase indexes created
- [ ] Collections initialized for test user
- [ ] User logged in

### Test Cases:

- [ ] Menu shows BBM Bucks option
- [ ] BBM Bucks user details component renders
- [ ] Billing screen shows redemption option
- [ ] Can redeem BBM Bucks for discount
- [ ] Order completion awards new BBM Bucks
- [ ] Balance updates correctly

### Troubleshooting:

#### "Index not found" errors:

- Create the required Firestore indexes as described above

#### BBM Bucks balance shows 0:

- Initialize user account with `initializeBBMBucksForUser(userId)`

#### Navigation errors:

- Ensure MenuScreen.js has been updated with the new BBM Bucks route

#### Components not rendering:

- Check that all BBM Bucks components are properly imported
- Verify BBMBucksContextProvider is wrapping the app

## Production Deployment

### Final Steps:

1. Remove any test/sample data
2. Set up proper error monitoring for BBM Bucks operations
3. Configure Firebase security rules for the new collections
4. Test with real user accounts
5. Monitor for any index creation needs in Firebase Console

## Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Verify all indexes are created and active
3. Ensure user is properly authenticated
4. Check browser console for JavaScript errors

The system is now fully integrated and ready for testing!

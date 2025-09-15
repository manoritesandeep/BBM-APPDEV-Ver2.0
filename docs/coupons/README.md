# Coupon System Documentation

## Overview

The coupon system allows customers to apply discount codes during checkout to receive various types of discounts on their orders.

## 🗄️ Firestore Database Structure

### Coupons Collection

```javascript
// Path: /coupons/{couponId}
{
  id: "SAVE20",
  code: "SAVE20",
  title: "Save 20% on Your Order",
  description: "Get 20% off on orders above ₹500",

  // Discount Configuration
  discountType: "percentage", // "percentage" | "fixed" | "free_shipping"
  discountValue: 20,          // 20% or ₹20
  maxDiscount: 100,           // Maximum discount amount (for percentage)

  // Validity
  isActive: true,
  validFrom: timestamp,
  validUntil: timestamp,

  // Usage Limits
  usageLimit: 100,            // Total usage limit
  usageCount: 45,             // Current usage count
  userUsageLimit: 1,          // Per user limit

  // Order Conditions
  minOrderAmount: 500,
  maxOrderAmount: null,
  applicableCategories: ["electronics", "clothing"], // null for all
  excludedCategories: ["gift-cards"],

  // User Restrictions
  newUsersOnly: false,
  specificUsers: [],          // Array of user IDs (empty for all users)

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "admin_user_id"
}
```

### User Coupon Usage Collection

```javascript
// Path: /userCouponUsage/{userId}_{couponId}
{
  userId: "user123",
  couponId: "SAVE20",
  usageCount: 1,
  lastUsed: timestamp,
  orderNumbers: ["ORD-001", "ORD-002"]
}
```

## 🎨 UI Components

### CouponSection (Billing)

- **Location**: `components/BillingComponents/CouponSection.js`
- **Purpose**: Input and display applied coupons during checkout
- **Features**:
  - Coupon code input field
  - Apply/Remove coupon functionality
  - Applied coupon display with discount amount
  - Error handling and validation feedback

### CouponContent (Menu)

- **Location**: `components/MenuComponents/CouponComponents/CouponContent.js`
- **Purpose**: Display available coupons to users
- **Features**:
  - List all available coupons
  - Copy coupon codes
  - Filter based on user eligibility
  - Show expiry warnings

## 🔧 Utility Functions

### couponUtils.js

**Location**: `util/couponUtils.js`

#### Main Functions:

1. **validateAndApplyCoupon(couponCode, orderData, userId)**

   - Validates coupon eligibility
   - Calculates discount amount
   - Returns validation result

2. **recordCouponUsage(couponId, userId, orderNumber)**

   - Records coupon usage after successful order
   - Updates usage counters
   - Tracks user-specific usage

3. **getAvailableCoupons(userId, orderAmount)**
   - Fetches all eligible coupons for user
   - Filters based on order amount and user restrictions

## 🎣 Hook Integration

### useBillingLogic Hook

**Location**: `hooks/useBillingLogic.js`

**New State:**

- `couponCode`: Current input value
- `appliedCoupon`: Applied coupon object
- `isCouponValidating`: Loading state for validation
- `couponError`: Error message

**New Functions:**

- `handleApplyCoupon`: Validates and applies coupon
- `handleRemoveCoupon`: Removes applied coupon
- `onCouponCodeChange`: Updates input value

## 💰 Discount Types

### 1. Percentage Discount

```javascript
{
  discountType: "percentage",
  discountValue: 20,        // 20%
  maxDiscount: 100         // Max ₹100 discount
}
```

### 2. Fixed Amount Discount

```javascript
{
  discountType: "fixed",
  discountValue: 50        // ₹50 off
}
```

### 3. Free Shipping

```javascript
{
  discountType: "free_shipping",
  discountValue: 0         // Removes shipping cost
}
```

## 🔒 Validation Rules

### Time-based Validation

- `validFrom`: Coupon start date
- `validUntil`: Coupon expiry date

### Usage Validation

- `usageLimit`: Total usage across all users
- `userUsageLimit`: Usage limit per user

### Order Validation

- `minOrderAmount`: Minimum order value required
- `maxOrderAmount`: Maximum order value allowed
- `applicableCategories`: Valid product categories
- `excludedCategories`: Excluded product categories

### User Validation

- `newUsersOnly`: Restrict to new users only
- `specificUsers`: Restrict to specific user IDs

## 📱 User Experience Flow

### In Billing Screen:

1. User enters coupon code
2. System validates coupon in real-time
3. If valid, discount is applied and shown
4. User can remove coupon if needed
5. Final order includes coupon details

### In Menu Section:

1. User navigates to Coupons via menu
2. System shows available coupons based on eligibility
3. User can copy coupon codes
4. Expired/expiring coupons are highlighted

## 🛠️ Admin Considerations

### Creating Coupons:

```javascript
// Sample coupon creation
await addDoc(collection(db, "coupons"), {
  code: "WELCOME25",
  title: "Welcome Discount",
  description: "25% off for new users",
  discountType: "percentage",
  discountValue: 25,
  maxDiscount: 200,
  isActive: true,
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  usageLimit: 1000,
  usageCount: 0,
  userUsageLimit: 1,
  minOrderAmount: 299,
  newUsersOnly: true,
  createdAt: new Date(),
  createdBy: "admin_id",
});
```

## 🔮 Future Enhancements

1. **Automatic Coupons**: Apply best available coupon automatically
2. **Coupon Stacking**: Allow multiple coupons (with rules)
3. **Referral Coupons**: Generate unique codes for referrals
4. **Location-based**: Coupons for specific cities/regions
5. **Product-specific**: Coupons for individual products
6. **Time-sensitive**: Flash coupons with countdown timers
7. **Analytics**: Coupon performance tracking

## 🧪 Testing Scenarios

1. **Valid Coupon Application**
2. **Invalid/Expired Coupon Handling**
3. **Usage Limit Validation**
4. **Minimum Order Amount Check**
5. **User Eligibility Verification**
6. **Multiple Coupon Attempts**
7. **Order Completion with Coupon**

## 📊 Analytics Tracking

Consider tracking:

- Coupon usage rates
- Popular coupon codes
- User coupon behavior
- Revenue impact
- Conversion rates with coupons

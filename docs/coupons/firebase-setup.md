# Firebase Coupon Setup Guide

## Test Coupon Document Structure

To test your coupon system, create a document in your Firestore `coupons` collection with the following structure:

### Document ID: `SAVE20`

```json
{
  "code": "SAVE20",
  "title": "Save 20% on Your Order",
  "description": "Get 20% off on orders above ₹100",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 500,
  "isActive": true,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "usageLimit": 1000,
  "usageCount": 0,
  "userUsageLimit": 5,
  "minOrderAmount": 100,
  "maxOrderAmount": null,
  "applicableCategories": [],
  "excludedCategories": [],
  "newUsersOnly": false,
  "specificUsers": [],
  "createdAt": "2024-08-11T00:00:00.000Z",
  "updatedAt": "2024-08-11T00:00:00.000Z",
  "createdBy": "admin"
}
```

## Key Points for Testing:

1. **Empty Arrays for Universal Access:**

   - `specificUsers: []` - Allows all users
   - `applicableCategories: []` - Applies to all categories
   - `excludedCategories: []` - No category restrictions

2. **Date Format:**

   - Use Firestore Timestamp type, not strings
   - In Firebase console: Use the timestamp picker

3. **Required Fields:**
   - `code`: Must be unique and uppercase
   - `isActive`: Must be `true`
   - `discountType`: "percentage", "fixed", or "free_shipping"
   - `discountValue`: The discount amount/percentage

## Firebase Console Setup Steps:

1. Go to Firestore Database
2. Create collection named `coupons`
3. Add document with ID `SAVE20`
4. Add all fields above with correct data types:
   - Strings: code, title, description, discountType, createdBy
   - Numbers: discountValue, maxDiscount, usageLimit, usageCount, userUsageLimit, minOrderAmount
   - Booleans: isActive, newUsersOnly
   - Arrays: applicableCategories, excludedCategories, specificUsers
   - Timestamps: validFrom, validUntil, createdAt, updatedAt
   - Null: maxOrderAmount (if no limit)

## Category Testing:

If you want to test with categories, your cart items should have a `category` field:

```javascript
// Example cart item
{
  id: "item1",
  productName: "Paint Brush",
  category: "paint", // This should match your coupon's applicableCategories
  price: 250,
  quantity: 2
}
```

## Common Issues:

1. **"This coupon is not available for your account"**

   - Check `specificUsers` array is empty `[]`
   - Ensure user is authenticated if required

2. **"Coupon not applicable for selected items"**

   - Check cart items have `category` field
   - Ensure categories match (case-insensitive now)
   - Or set `applicableCategories: []` for all items

3. **Firebase Index Error**
   - Fixed by simplifying query to only use `isActive`
   - Manual filtering is now done in code

## Console Logging:

The updated code now includes extensive console logging. Check your browser/Metro console for:

- 🎫 Coupon validation steps
- 🛒 Cart items being checked
- 🔍 Category matching
- ✅/❌ Validation results

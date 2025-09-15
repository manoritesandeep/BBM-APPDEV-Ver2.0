# BBM Bucks Reward System Documentation

## Overview

The BBM Bucks reward system is a loyalty program for Build Bharat Mart that rewards authenticated customers with points for every purchase. These points can be redeemed for discounts on future orders.

## Key Features

### 🎯 Reward Structure

- **Standard Tier**: 1% back on orders up to ₹24,999
- **Premium Tier**: 1.5% back on orders ₹25,000 - ₹49,999
- **Elite Tier**: 2% back on orders ₹50,000+

### 💰 Conversion Rate

- 10 BBM Bucks = ₹1 discount
- Example: 1000 BBM Bucks = ₹100 discount

### ⏰ Validity & Rules

- BBM Bucks expire after 12 months
- Minimum redemption: 50 BBM Bucks (₹5)
- Maximum redemption: 50% of order value
- Excluded categories: gift-cards, warranties, installation-services

## Implementation Architecture

### 1. Database Collections

#### `user_bbm_balance` Collection

```javascript
{
  userId: "user_id",
  totalEarned: 1500,          // Total BBM Bucks ever earned
  totalRedeemed: 200,         // Total BBM Bucks redeemed
  currentBalance: 1300,       // Available balance
  lifetimeBalance: 1500,      // Same as totalEarned
  createdAt: Timestamp,
  lastUpdated: Timestamp,
  lastEarnedAmount: 100,      // Last earning amount
  lastEarnedDate: Timestamp,
  lastRedeemedAmount: 50,     // Last redemption amount
  lastRedeemedDate: Timestamp,
  tier: "STANDARD"            // Current tier
}
```

#### `bbm_bucks_transactions` Collection

```javascript
{
  transactionId: "txn_uuid",
  userId: "user_id",
  orderId: "order_id",
  type: "EARNED" | "REDEEMED" | "EXPIRED",
  amount: 100,                // BBM Bucks amount (negative for redemptions)
  orderValue: 10000,          // Original order value (for EARNED)
  discountValue: 10,          // Discount value in rupees (for REDEEMED)
  rewardPercentage: 1.0,      // Reward percentage used
  tier: "STANDARD",           // Tier when earned
  description: "Earned from order #12345",
  createdAt: Timestamp,
  expiryDate: Timestamp,      // 12 months from creation (for EARNED)
  expiredAt: Timestamp,       // When it was expired (for EXPIRED)
  status: "ACTIVE" | "USED" | "EXPIRED",
  categories: ["category1"]   // Product categories (for exclusion rules)
}
```

### 2. Components Structure

```
components/BillingComponents/BBMBucks/
├── index.js                    # Export index
├── BBMBucksRedemption.js      # Redemption component for billing
├── BBMBucksRewardDisplay.js   # Shows potential reward
└── BBMBucksOrderSuccess.js    # Order success reward display

components/MenuComponents/BBMBucksUserDetails/
└── BBMBucksUserDetails.js     # User dashboard for BBM Bucks

store/
└── bbm-bucks-context.js       # React Context for state management

util/
└── bbmBucksService.js         # Core business logic service
```

### 3. Core Service Methods

#### `BBMBucksService`

- `calculateReward(orderAmount, categories)` - Calculate reward for order
- `awardBBMBucks(userId, orderId, orderAmount, categories)` - Award BBM Bucks
- `redeemBBMBucks(userId, redeemAmount, orderId)` - Redeem BBM Bucks
- `getUserBalance(userId)` - Get user's current balance
- `getTransactionHistory(userId, limit)` - Get transaction history
- `getExpiringBBMBucks(userId, days)` - Get expiring BBM Bucks
- `expireOldBBMBucks(userId)` - Expire old BBM Bucks (admin function)

## Usage Examples

### 1. Award BBM Bucks After Order

```javascript
import BBMBucksService from "../util/bbmBucksService";

// In your order completion logic
const orderAmount = 15000;
const categories = ["tools", "hardware"];
const userId = "user123";
const orderId = "order456";

try {
  const reward = await BBMBucksService.awardBBMBucks(
    userId,
    orderId,
    orderAmount,
    categories
  );

  console.log(`Awarded ${reward.bbmBucks} BBM Bucks!`);
} catch (error) {
  console.error("Failed to award BBM Bucks:", error);
}
```

### 2. Redeem BBM Bucks During Checkout

```javascript
// In your checkout logic
const redeemAmount = 100; // 100 BBM Bucks
const orderId = "order789";

try {
  const discountValue = await BBMBucksService.redeemBBMBucks(
    userId,
    redeemAmount,
    orderId
  );

  // Apply discount to order
  console.log(`Applied ₹${discountValue} discount`);
} catch (error) {
  console.error("Failed to redeem BBM Bucks:", error);
}
```

### 3. Using Components in Billing Screen

```javascript
import {
  BBMBucksRedemption,
  BBMBucksRewardDisplay,
} from "../components/BillingComponents/BBMBucks";

function BillingScreen() {
  const [bbmBucksApplied, setBbmBucksApplied] = useState(0);
  const [bbmBucksDiscount, setBbmBucksDiscount] = useState(0);

  return (
    <View>
      {/* Show potential reward */}
      <BBMBucksRewardDisplay
        orderAmount={orderTotal}
        categories={orderCategories}
        onSignUpPress={() => navigateToSignUp()}
      />

      {/* Redemption component */}
      <BBMBucksRedemption
        orderAmount={orderTotal}
        categories={orderCategories}
        onRedemptionChange={(amount, discount) => {
          setBbmBucksApplied(amount);
          setBbmBucksDiscount(discount);
        }}
        appliedAmount={bbmBucksApplied}
      />
    </View>
  );
}
```

## Business Logic

### Tier Calculation

The system automatically determines the reward tier based on order amount:

- Orders are evaluated at time of purchase
- Higher tiers apply to the entire order amount
- Tier benefits are immediate (no accumulation required)

### Exclusion Rules

Certain categories are excluded from earning BBM Bucks:

- Gift cards
- Extended warranties
- Installation services

### Expiry Management

- BBM Bucks expire 12 months after earning
- Expiry is tracked per transaction
- Admin function available to process expired BBM Bucks
- Users are notified of expiring BBM Bucks (future feature)

### Fraud Prevention

- Transaction limits can be implemented
- All transactions are logged with audit trail
- Redemption limits based on order value
- Category-based restrictions

## Future Enhancements

### Push Notifications (Commented Code Available)

```javascript
// Example notification for expiring BBM Bucks
// import { sendPushNotification } from '../util/pushNotifications';

// const expiringBucks = await BBMBucksService.getExpiringBBMBucks(userId, 7);
// if (expiringBucks.length > 0) {
//   await sendPushNotification(userId, {
//     title: 'BBM Bucks Expiring Soon!',
//     body: `${totalExpiring} BBM Bucks expire in 7 days. Use them now!`,
//     data: { type: 'expiring_bbm_bucks', amount: totalExpiring }
//   });
// }
```

### Advanced Features

- Bonus multipliers for special events
- Referral bonuses
- Birthday/anniversary rewards
- Tier-based exclusive offers
- Gamification elements

## Testing

### Test Scenarios

1. **Reward Calculation**: Test all tier thresholds
2. **Exclusion Logic**: Verify excluded categories don't earn rewards
3. **Redemption Limits**: Test minimum/maximum redemption rules
4. **Expiry Logic**: Test BBM Bucks expiration
5. **Balance Updates**: Verify correct balance calculations
6. **Transaction History**: Ensure proper audit trail

### Sample Test Data

```javascript
// Test cases for reward calculation
const testCases = [
  { amount: 5000, expected: { bbmBucks: 50, tier: "Standard" } },
  { amount: 25000, expected: { bbmBucks: 375, tier: "Premium" } },
  { amount: 50000, expected: { bbmBucks: 1000, tier: "Elite" } },
];
```

## Security Considerations

1. **Data Validation**: All inputs are validated before processing
2. **Transaction Integrity**: Batch operations ensure data consistency
3. **Audit Trail**: Complete transaction history for accountability
4. **Access Control**: User can only access their own BBM Bucks data
5. **Rate Limiting**: Prevent abuse through transaction limits

## Performance Optimization

1. **Indexed Queries**: Firestore indexes on userId and createdAt
2. **Batch Operations**: Multiple database updates in single transaction
3. **Caching**: User balance cached in React Context
4. **Lazy Loading**: Transaction history loaded on demand
5. **Efficient Queries**: Limited result sets with pagination

## Monitoring & Analytics

### Key Metrics to Track

- Total BBM Bucks issued
- Redemption rates
- Average time to redemption
- Tier distribution
- Category exclusion impact
- User engagement with rewards

### Recommended Dashboards

- Real-time BBM Bucks issuance
- Monthly redemption trends
- User tier progression
- Expiry rates and amounts
- Popular redemption patterns

# BBM Bucks Integration Guide

This guide shows how to integrate BBM Bucks components into your existing app.

## Quick Setup

### 1. Add BBM Bucks Context to App.js

```javascript
// App.js
import BBMBucksContextProvider from "./store/bbm-bucks-context";

export default function App() {
  return (
    <AuthContextProvider>
      <BBMBucksContextProvider>
        {/* Your existing app content */}
      </BBMBucksContextProvider>
    </AuthContextProvider>
  );
}
```

### 2. Update Menu Screen

```javascript
// screens/MenuScreen.js or components/MenuComponents/MenuScreenOutput.js
import BBMBucksUserDetails from "../components/MenuComponents/BBMBucksUserDetails/BBMBucksUserDetails";

function MenuScreen({ navigation }) {
  const handleSignUpPress = () => {
    navigation.navigate("UnifiedAuth");
  };

  return (
    <ScrollView>
      {/* Your existing menu items */}
      <BBMBucksUserDetails onSignUpPress={handleSignUpPress} />
      {/* Rest of menu */}
    </ScrollView>
  );
}
```

### 3. Update Billing Screen

```javascript
// screens/BillingScreen.js
import {
  BBMBucksRedemption,
  BBMBucksRewardDisplay,
} from "../components/BillingComponents/BBMBucks";

function BillingScreen() {
  const [bbmBucksApplied, setBbmBucksApplied] = useState(0);
  const [bbmBucksDiscount, setBbmBucksDiscount] = useState(0);

  // Calculate final total including BBM Bucks discount
  const finalTotal = orderTotal - bbmBucksDiscount;

  return (
    <ScrollView>
      {/* Your existing billing components */}

      {/* Show potential reward */}
      <BBMBucksRewardDisplay
        orderAmount={orderTotal}
        categories={getOrderCategories()}
        onSignUpPress={() => navigation.navigate("UnifiedAuth")}
      />

      {/* Redemption component */}
      <BBMBucksRedemption
        orderAmount={orderTotal}
        categories={getOrderCategories()}
        onRedemptionChange={(amount, discount) => {
          setBbmBucksApplied(amount);
          setBbmBucksDiscount(discount);
        }}
        appliedAmount={bbmBucksApplied}
      />

      {/* Your existing order summary with updated total */}
      <OrderSummary finalTotal={finalTotal} />
    </ScrollView>
  );
}
```

### 4. Award BBM Bucks After Order

```javascript
// In your order completion logic (paymentService.js or similar)
import BBMBucksService from "./bbmBucksService";

async function completeOrder(orderData) {
  try {
    // Process payment first
    const paymentResult = await processPayment(orderData);

    if (paymentResult.success) {
      // Award BBM Bucks for authenticated users
      if (orderData.userId) {
        try {
          await BBMBucksService.awardBBMBucks(
            orderData.userId,
            paymentResult.orderId,
            orderData.amount,
            orderData.categories || []
          );
        } catch (rewardError) {
          // Log error but don't fail the order
          console.error("Failed to award BBM Bucks:", rewardError);
        }
      }

      return paymentResult;
    }
  } catch (error) {
    throw error;
  }
}
```

## Component Props Reference

### BBMBucksUserDetails

```javascript
<BBMBucksUserDetails
  onSignUpPress={function}  // Called when user taps signup button
/>
```

### BBMBucksRewardDisplay

```javascript
<BBMBucksRewardDisplay
  orderAmount={number}      // Order total amount
  categories={array}        // Array of category strings
  onSignUpPress={function}  // Called for non-authenticated users
/>
```

### BBMBucksRedemption

```javascript
<BBMBucksRedemption
  orderAmount={number}      // Order total amount
  categories={array}        // Array of category strings
  onRedemptionChange={function} // (amount, discount) => void
  appliedAmount={number}    // Currently applied BBM Bucks
  disabled={boolean}        // Disable redemption functionality
/>
```

### BBMBucksOrderSuccess

```javascript
<BBMBucksOrderSuccess
  orderId={string}          // Order ID
  orderAmount={number}      // Order total amount
  categories={array}        // Array of category strings
  rewardEarned={object}     // Pre-calculated reward (optional)
  onRewardProcessed={function} // Called when reward is processed
/>
```

## Service Integration Examples

### Check if User Can Earn Rewards

```javascript
import BBMBucksService from "../util/bbmBucksService";

const canEarnRewards = BBMBucksService.canUseBBMBucks(orderAmount, [
  "tools",
  "hardware",
]);
```

### Calculate Potential Reward

```javascript
const reward = BBMBucksService.calculateReward(15000, ["tools"]);
// Returns: { bbmBucks: 150, percentage: 1.0, discountValue: 15, tier: 'Standard' }
```

### Get User Balance

```javascript
import { useContext } from "react";
import { BBMBucksContext } from "../store/bbm-bucks-context";

function MyComponent() {
  const { balance, loading } = useContext(BBMBucksContext);

  if (loading) return <LoadingSpinner />;

  return <Text>Available: {balance?.currentBalance || 0} BBM Bucks</Text>;
}
```

## Error Handling

### Common Error Scenarios

```javascript
try {
  await BBMBucksService.redeemBBMBucks(userId, amount, orderId);
} catch (error) {
  switch (error.message) {
    case "Insufficient BBM Bucks balance":
      // Handle insufficient balance
      break;
    case "Minimum redemption is 50 BBM Bucks (₹5)":
      // Handle minimum redemption error
      break;
    default:
    // Handle general errors
  }
}
```

## Styling Customization

All components use your existing `constants/styles.js` and `constants/responsive.js`. To customize:

```javascript
// In your styles file, add BBM Bucks specific colors
export const Colors = {
  // ... existing colors
  bbmPrimary: "#FF6B35", // BBM Bucks primary color
  bbmSecondary: "#4CAF50", // Success/earning color
  bbmBackground: "#FFF3E0", // Light background
};
```

## Testing Integration

### Test Reward Flow

```javascript
// Test file example
import BBMBucksService from "../util/bbmBucksService";

describe("BBM Bucks Integration", () => {
  test("should calculate correct reward for standard tier", () => {
    const reward = BBMBucksService.calculateReward(10000, []);
    expect(reward.bbmBucks).toBe(100);
    expect(reward.tier).toBe("Standard");
  });

  test("should handle excluded categories", () => {
    const reward = BBMBucksService.calculateReward(10000, ["gift-cards"]);
    expect(reward.bbmBucks).toBe(0);
    expect(reward.reason).toContain("excluded categories");
  });
});
```

## Performance Considerations

1. **Context Usage**: BBM Bucks context automatically loads user balance on login
2. **Lazy Loading**: Transaction history is loaded only when requested
3. **Caching**: Balance is cached in context to avoid repeated API calls
4. **Batch Operations**: All BBM Bucks operations use Firestore batch writes

## Common Integration Issues

### Issue: Components not showing

**Solution**: Ensure BBMBucksContextProvider wraps your app

### Issue: Balance not updating

**Solution**: Call `refreshBalance()` from context after operations

### Issue: Firestore permission errors

**Solution**: Ensure your Firestore security rules allow authenticated users to read/write their BBM Bucks data

```javascript
// Firestore security rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // BBM Bucks balance - users can only access their own
    match /user_bbm_balance/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // BBM Bucks transactions - users can only access their own
    match /bbm_bucks_transactions/{transactionId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

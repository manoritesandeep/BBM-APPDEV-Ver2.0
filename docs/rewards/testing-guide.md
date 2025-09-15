# BBM Bucks Testing Guide

## Manual Testing Checklist

### 1. Authentication Flow

- [ ] Unauthenticated user sees BBM Bucks signup prompt in menu
- [ ] Signup button navigates to authentication screen
- [ ] After authentication, BBM Bucks dashboard loads properly
- [ ] User balance initializes correctly (0 BBM Bucks for new users)

### 2. Menu Integration

- [ ] BBM Bucks menu item appears in sidebar
- [ ] Selecting BBM Bucks shows proper content
- [ ] All menu components render without errors
- [ ] Navigation between menu items works smoothly

### 3. Reward Calculation

Test reward calculations for different order amounts:

- [ ] ₹5,000 order → 50 BBM Bucks (1%)
- [ ] ₹25,000 order → 375 BBM Bucks (1.5%)
- [ ] ₹50,000 order → 1,000 BBM Bucks (2%)
- [ ] ₹100,000 order → 2,000 BBM Bucks (2%)

### 4. Excluded Categories

- [ ] Orders with gift-cards don't earn BBM Bucks
- [ ] Orders with warranties don't earn BBM Bucks
- [ ] Orders with installation-services don't earn BBM Bucks
- [ ] Mixed orders with excluded categories don't earn BBM Bucks

### 5. Redemption Flow

- [ ] User can see available balance
- [ ] Minimum redemption enforced (50 BBM Bucks)
- [ ] Maximum redemption enforced (50% of order value)
- [ ] Redemption input validation works
- [ ] Applied redemption shows correctly in billing
- [ ] User can remove applied redemption

### 6. Order Processing

- [ ] BBM Bucks are awarded after successful order
- [ ] Redemption is processed during checkout
- [ ] Balance updates correctly after transactions
- [ ] Transaction history records properly

### 7. UI/UX Testing

- [ ] All components are responsive on different screen sizes
- [ ] Loading states display properly
- [ ] Error messages are user-friendly
- [ ] Success animations work smoothly
- [ ] Color scheme matches app design

## Automated Testing

### Unit Tests for BBMBucksService

```javascript
// Test file: __tests__/bbmBucksService.test.js
import BBMBucksService from "../util/bbmBucksService";

describe("BBMBucksService", () => {
  describe("calculateReward", () => {
    test("calculates standard tier correctly", () => {
      const reward = BBMBucksService.calculateReward(10000, []);
      expect(reward.bbmBucks).toBe(100);
      expect(reward.percentage).toBe(1.0);
      expect(reward.tier).toBe("Standard");
      expect(reward.discountValue).toBe(10);
    });

    test("calculates premium tier correctly", () => {
      const reward = BBMBucksService.calculateReward(30000, []);
      expect(reward.bbmBucks).toBe(450);
      expect(reward.percentage).toBe(1.5);
      expect(reward.tier).toBe("Premium");
    });

    test("calculates elite tier correctly", () => {
      const reward = BBMBucksService.calculateReward(60000, []);
      expect(reward.bbmBucks).toBe(1200);
      expect(reward.percentage).toBe(2.0);
      expect(reward.tier).toBe("Elite");
    });

    test("handles excluded categories", () => {
      const reward = BBMBucksService.calculateReward(10000, ["gift-cards"]);
      expect(reward.bbmBucks).toBe(0);
      expect(reward.reason).toContain("excluded categories");
    });

    test("handles mixed categories with exclusions", () => {
      const reward = BBMBucksService.calculateReward(10000, [
        "tools",
        "gift-cards",
      ]);
      expect(reward.bbmBucks).toBe(0);
    });
  });

  describe("canUseBBMBucks", () => {
    test("allows BBM Bucks for normal categories", () => {
      const canUse = BBMBucksService.canUseBBMBucks(5000, [
        "tools",
        "hardware",
      ]);
      expect(canUse).toBe(true);
    });

    test("disallows BBM Bucks for excluded categories", () => {
      const canUse = BBMBucksService.canUseBBMBucks(5000, ["gift-cards"]);
      expect(canUse).toBe(false);
    });
  });

  describe("getMaxRedeemableAmount", () => {
    test("limits to 50% of order value", () => {
      const maxRedeemable = BBMBucksService.getMaxRedeemableAmount(1000, 1000);
      expect(maxRedeemable).toBe(500); // 50% of ₹100 = ₹50 = 500 BBM Bucks
    });

    test("limits to available balance", () => {
      const maxRedeemable = BBMBucksService.getMaxRedeemableAmount(100, 2000);
      expect(maxRedeemable).toBe(50); // Rounded down to nearest 50
    });
  });
});
```

### Integration Tests for Components

```javascript
// Test file: __tests__/BBMBucksComponents.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { BBMBucksRedemption } from "../components/BillingComponents/BBMBucks";
import { BBMBucksContext } from "../store/bbm-bucks-context";
import { AuthContext } from "../store/auth-context";

const mockBBMBucksContext = {
  balance: { currentBalance: 500, discountValue: "50.00" },
  loading: false,
  canRedeem: true,
  getMaxRedeemable: jest.fn(() => 250),
  minimumRedemption: 50,
  conversionRate: 10,
};

const mockAuthContext = {
  isAuthenticated: true,
  userId: "test-user",
};

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <BBMBucksContext.Provider value={mockBBMBucksContext}>
        {component}
      </BBMBucksContext.Provider>
    </AuthContext.Provider>
  );
};

describe("BBMBucksRedemption", () => {
  test("renders available balance correctly", () => {
    const { getByText } = renderWithContext(
      <BBMBucksRedemption orderAmount={1000} onRedemptionChange={jest.fn()} />
    );

    expect(getByText("500 BBM Bucks (₹50.00)")).toBeTruthy();
  });

  test("handles redemption flow", async () => {
    const onRedemptionChange = jest.fn();
    const { getByText, getByDisplayValue } = renderWithContext(
      <BBMBucksRedemption
        orderAmount={1000}
        onRedemptionChange={onRedemptionChange}
      />
    );

    // Open redemption form
    fireEvent.press(getByText("Use"));

    // Enter redemption amount
    const input = getByDisplayValue("0");
    fireEvent.changeText(input, "100");

    // Apply redemption
    fireEvent.press(getByText("Apply"));

    await waitFor(() => {
      expect(onRedemptionChange).toHaveBeenCalledWith(100, 10);
    });
  });
});
```

## Performance Testing

### Load Testing Scenarios

1. **Concurrent Users**: Test with multiple users earning/redeeming BBM Bucks simultaneously
2. **Large Transactions**: Test with high-value orders (₹100k+)
3. **Bulk Operations**: Test expiry processing with many transactions
4. **Database Load**: Monitor Firestore read/write operations under load

### Memory Testing

- Monitor React Native memory usage with BBM Bucks context
- Test for memory leaks in transaction history loading
- Verify proper cleanup of listeners and subscriptions

## Security Testing

### Authentication Testing

- [ ] Unauthenticated users cannot access BBM Bucks data
- [ ] Users cannot access other users' BBM Bucks data
- [ ] Admin operations require proper permissions

### Data Validation Testing

- [ ] Negative BBM Bucks amounts are rejected
- [ ] Invalid user IDs are handled properly
- [ ] Malformed transaction data is rejected
- [ ] SQL injection attempts are blocked (though using Firestore)

### Rate Limiting Testing

- [ ] Rapid redemption attempts are throttled
- [ ] Multiple simultaneous transactions are handled correctly
- [ ] Firestore quotas are respected

## Edge Cases Testing

### Network Conditions

- [ ] Poor connectivity during BBM Bucks operations
- [ ] Offline functionality (cached balance display)
- [ ] Network timeouts during transactions

### Data Edge Cases

- [ ] Very large BBM Bucks balances (millions)
- [ ] Zero-amount orders
- [ ] Negative order amounts (refunds)
- [ ] Orders with only excluded categories

### User Journey Edge Cases

- [ ] User logs out during redemption process
- [ ] App backgrounded during BBM Bucks operation
- [ ] Navigation away from billing screen with pending redemption

## Browser/Device Testing

### Device Testing

- [ ] iOS (iPhone SE, iPhone 14 Pro, iPad)
- [ ] Android (Small screen, Large screen, Tablet)
- [ ] Different screen densities and orientations

### Performance on Different Devices

- [ ] Low-end devices (older phones)
- [ ] High-end devices (flagship phones)
- [ ] Tablet-specific layouts and interactions

## Debugging Tools

### Console Logging

Enable detailed logging for BBM Bucks operations:

```javascript
// In development, enable debug logs
if (__DEV__) {
  console.log("BBM Bucks Debug Mode Enabled");
  // Log all BBM Bucks service calls
  // Log context state changes
  // Log component re-renders
}
```

### React Native Debugger

- Monitor BBM Bucks context state changes
- Track component re-renders
- Debug network requests to Firestore

### Firebase Console Monitoring

- Monitor Firestore reads/writes
- Check security rule violations
- Track performance metrics

## Test Data Setup

### Sample Users

```javascript
const testUsers = [
  {
    id: "test-user-1",
    balance: 1000,
    tier: "Standard",
  },
  {
    id: "test-user-2",
    balance: 50,
    tier: "Standard",
  },
  {
    id: "test-user-3",
    balance: 0,
    tier: "Standard",
  },
];
```

### Sample Orders

```javascript
const testOrders = [
  { amount: 5000, categories: ["tools"] }, // Standard tier
  { amount: 30000, categories: ["materials"] }, // Premium tier
  { amount: 60000, categories: ["equipment"] }, // Elite tier
  { amount: 10000, categories: ["gift-cards"] }, // Excluded
];
```

## Regression Testing

Before each release, verify:

- [ ] All existing BBM Bucks functionality works
- [ ] No performance regressions
- [ ] UI/UX remains consistent
- [ ] New features don't break existing flows
- [ ] Database migrations work correctly

## User Acceptance Testing

### Business Stakeholder Review

- [ ] Reward calculations match business requirements
- [ ] Exclusion rules are properly implemented
- [ ] User experience meets expectations
- [ ] Financial impact is accurately calculated

### End User Testing

- [ ] Non-technical users can understand the system
- [ ] Redemption process is intuitive
- [ ] Error messages are clear and helpful
- [ ] Overall flow feels natural and beneficial

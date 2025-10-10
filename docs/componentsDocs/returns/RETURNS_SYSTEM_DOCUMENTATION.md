# Returns System Documentation

## Overview

The Returns System for Build Bharat Mart (BBM) provides a comprehensive solution for customers to request returns for their orders. The system includes eligibility checking, flexible refund options, and complete order lifecycle management.

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Business Rules](#business-rules)
3. [Technical Architecture](#technical-architecture)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [Database Schema](#database-schema)
7. [Implementation Guide](#implementation-guide)
8. [Testing Scenarios](#testing-scenarios)

## Feature Overview

### Key Features

- **Return Eligibility Verification**: Automated checking based on order status, delivery confirmation, and time windows
- **Flexible Return Options**: Full returns, partial returns, and individual item returns
- **Multiple Refund Methods**: Original payment method or BBM Bucks with 1% bonus incentive
- **Smart Discount Calculation**: Prorated refund calculations that account for applied discounts and coupons
- **Real-time Status Tracking**: Complete return request lifecycle tracking
- **User-friendly Interface**: Multi-step wizard with clear validation and feedback

### User Journey

1. **Initiate Return**: Customer clicks "Request Return" from order details
2. **Eligibility Check**: System verifies return eligibility automatically
3. **Item Selection**: Choose full or partial return with specific quantities
4. **Return Reason**: Select from predefined reasons or specify custom reason
5. **Refund Method**: Choose between original payment method or BBM Bucks (+1% bonus)
6. **Review & Submit**: Confirm details and submit return request
7. **Confirmation**: Receive confirmation with reference number and next steps

## Business Rules

### Return Eligibility

```javascript
// Basic eligibility requirements
const eligibilityRules = {
  orderStatus: ["delivered"], // Only delivered orders
  timeWindow: {
    default: 7, // 7 days from delivery
    paint: 3, // 3 days for paint products
    mirrors: 14, // 14 days for LED mirrors
    tools: 10, // 10 days for tools/equipment
  },
  excludedItems: ["sanitaryware", "hygiene"], // Non-returnable categories
  minimumAmount: 0, // No minimum order amount required
};
```

### Refund Calculations

#### Discount Proration Logic

```javascript
// Example: Order with ₹1000 items, ₹100 discount, returning ₹300 worth of items
const orderTotal = 1000;
const discountAmount = 100;
const returnItemsValue = 300;

// Prorated discount deduction
const discountProportion = returnItemsValue / orderTotal; // 0.3
const discountDeduction = discountAmount * discountProportion; // ₹30

// Final refund calculation
const baseRefund = returnItemsValue - discountDeduction; // ₹270
const bonusAmount = refundMethod === "bbmBucks" ? baseRefund * 0.01 : 0; // ₹2.70
const finalRefund = baseRefund + bonusAmount; // ₹272.70 (if BBM Bucks)
```

#### Shipping Refund Rules

- Full refund of shipping charges for full returns
- Partial shipping refund for partial returns (prorated by item value)
- No shipping refund if return is due to customer preference

### Return Processing Timeline

| Status               | Description                                | Typical Duration  |
| -------------------- | ------------------------------------------ | ----------------- |
| **Processing**       | Return request submitted and under review  | 1-2 business days |
| **Approved**         | Return approved, awaiting pickup/shipment  | Immediate         |
| **Pickup Scheduled** | Pickup scheduled with logistics partner    | 1-3 business days |
| **In Transit**       | Item collected and in transit to warehouse | 3-7 business days |
| **Received**         | Item received at warehouse                 | Immediate         |
| **Under Inspection** | Quality check and condition verification   | 1-2 business days |
| **Refunded**         | Refund processed to selected method        | 3-7 business days |
| **Rejected**         | Return rejected due to condition/policy    | 1-2 business days |

## Technical Architecture

### Context Management

```javascript
// State structure
const returnsState = {
  activeReturn: null, // Current return being created
  returnsList: [], // User's return history
  loading: false, // Loading state
  error: null, // Error state
  eligibilityCache: {}, // Cached eligibility results
  refundCalculations: {}, // Cached refund calculations
};

// Available actions
const actions = [
  "SET_ACTIVE_RETURN",
  "UPDATE_RETURN_ITEMS",
  "SET_RETURN_REASON",
  "SET_REFUND_METHOD",
  "SUBMIT_RETURN_REQUEST",
  "FETCH_RETURNS_LIST",
  "CALCULATE_REFUND",
  "CHECK_ELIGIBILITY",
];
```

### API Structure

```javascript
// Core API functions
const returnsApi = {
  // Eligibility and validation
  checkReturnEligibility(orderId, userId),
  validateReturnRequest(returnData),

  // Refund calculations
  calculateRefundAmount(order, returnItems, refundMethod),
  calculateDiscountProration(order, returnItems),

  // CRUD operations
  submitReturnRequest(returnData),
  updateReturnStatus(returnId, status, notes),
  fetchReturnDetails(returnId),
  fetchUserReturns(userId),

  // Processing
  processRefund(returnId, refundDetails),
  cancelReturn(returnId, reason)
};
```

### Hook Architecture

```javascript
// useReturnRequest hook structure
const useReturnRequest = (order) => {
  // Form state management
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("original");

  // Calculations and validation
  const eligibilityResult = useMemo(() => checkEligibility(order), [order]);
  const refundCalculation = useMemo(
    () => calculateRefund(),
    [selectedItems, refundMethod]
  );

  // Form handlers
  const validateStep = (stepNumber) => {
    /* validation logic */
  };
  const submitReturn = async () => {
    /* submission logic */
  };

  return {
    // State
    step,
    selectedItems,
    returnReason,
    refundMethod,
    eligibilityResult,
    refundCalculation,

    // Actions
    setStep,
    updateSelectedItems,
    setReturnReason,
    setRefundMethod,
    validateStep,
    submitReturn,
  };
};
```

## API Reference

### Core Functions

#### `checkReturnEligibility(orderId, userId)`

Validates if an order is eligible for return.

**Parameters:**

- `orderId` (string): Order identifier
- `userId` (string): User identifier

**Returns:**

```javascript
{
  eligible: boolean,
  reason: string,
  timeRemaining: number, // days
  eligibleItems: Array<{
    productId: string,
    quantity: number,
    returnWindow: number
  }>
}
```

**Business Logic:**

- Order must be delivered
- Within return window (varies by product category)
- Not previously returned
- Item category allows returns

#### `calculateRefundAmount(order, returnItems, refundMethod)`

Calculates refund amount with proper discount proration.

**Parameters:**

- `order` (Object): Complete order details
- `returnItems` (Array): Items being returned with quantities
- `refundMethod` (string): 'original' or 'bbmBucks'

**Returns:**

```javascript
{
  itemsTotal: number,
  discountDeduction: number,
  shippingRefund: number,
  baseRefund: number,
  bonusAmount: number,
  finalRefund: number,
  refundBreakdown: {
    byItem: Array<{
      productId: string,
      quantity: number,
      unitPrice: number,
      totalRefund: number
    }>,
    discountProration: number,
    shippingProration: number
  }
}
```

#### `submitReturnRequest(returnData)`

Submits a new return request to the system.

**Parameters:**

```javascript
{
  orderId: string,
  userId: string,
  returnItems: Array<{
    productId: string,
    quantity: number,
    reason: string
  }>,
  returnReason: string,
  refundMethod: 'original' | 'bbmBucks',
  contactInfo: {
    phone: string,
    email: string
  }
}
```

**Returns:**

```javascript
{
  success: boolean,
  returnId: string,
  referenceNumber: string,
  estimatedProcessingTime: string,
  nextSteps: Array<string>
}
```

## UI Components

### Component Hierarchy

```
ReturnRequestScreen (Main Screen)
├── ReturnEligibilityStep (Step 1)
│   ├── OrderSummaryCard
│   └── EligibilityStatusCard
├── ReturnItemSelectionStep (Step 2)
│   ├── ItemSelectionCard (per item)
│   └── QuantitySelector
├── ReturnReasonStep (Step 3)
│   ├── ReasonSelector
│   └── CustomReasonInput
├── RefundMethodStep (Step 4)
│   ├── RefundMethodSelector
│   ├── RefundCalculationSummary
│   └── BBMBucksIncentiveCard
└── ReturnReviewStep (Step 5)
    ├── ReturnSummaryCard
    ├── RefundBreakdownCard
    └── SubmissionConfirmation

ReturnsListScreen
├── ReturnStatusFilter
├── ReturnCard (per return)
│   ├── ReturnStatusBadge
│   ├── ReturnItemsList
│   └── RefundStatusCard
└── EmptyReturnsState

ReturnButton (Reusable Component)
├── EligibilityCheck
└── NavigationHandler
```

### Key Component Props

#### ReturnRequestScreen

```javascript
{
  route: {
    params: {
      order: Object // Complete order details
    }
  },
  navigation: NavigationProp
}
```

#### ReturnButton

```javascript
{
  order: Object,              // Order details
  onPress: Function,          // Navigation handler
  variant: 'filled' | 'outline',
  disabled: boolean,
  style: StyleSheet
}
```

#### ReturnsListScreen

```javascript
{
  navigation: NavigationProp,
  userId: string             // From auth context
}
```

## Database Schema

### Returns Collection

```javascript
// Collection: 'returns'
{
  id: string,                    // Auto-generated return ID
  userId: string,                // User who requested return
  orderId: string,               // Associated order ID
  returnNumber: string,          // Human-readable return number (RTN-YYYYMMDD-XXXX)

  // Return details
  returnItems: Array<{
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number,
    reason: string
  }>,

  returnReason: string,          // Primary return reason
  refundMethod: 'original' | 'bbmBucks',

  // Financial calculations
  refundCalculation: {
    itemsTotal: number,
    discountDeduction: number,
    shippingRefund: number,
    baseRefund: number,
    bonusAmount: number,
    finalRefund: number
  },

  // Status tracking
  status: 'processing' | 'approved' | 'pickupScheduled' | 'inTransit' |
          'received' | 'inspecting' | 'refunded' | 'rejected' | 'cancelled',
  statusHistory: Array<{
    status: string,
    timestamp: Timestamp,
    notes: string,
    updatedBy: string
  }>,

  // Contact and logistics
  contactInfo: {
    phone: string,
    email: string,
    address: Object            // Pickup address
  },

  pickupDetails: {
    scheduled: boolean,
    scheduledDate: Timestamp,
    actualDate: Timestamp,
    trackingNumber: string,
    courierService: string
  },

  // Refund processing
  refundDetails: {
    processed: boolean,
    processedDate: Timestamp,
    transactionId: string,
    method: string,            // Actual refund method used
    amount: number             // Final refunded amount
  },

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  notes: Array<{
    text: string,
    timestamp: Timestamp,
    author: string,
    type: 'system' | 'customer' | 'admin'
  }>
}
```

### Orders Collection Updates

```javascript
// Additional fields added to existing orders
{
  // ... existing order fields ...

  // Return-related fields
  isReturnable: boolean,         // Can this order be returned?
  returnWindow: number,          // Return window in days
  deliveredAt: Timestamp,        // Exact delivery timestamp

  // Return status
  returnRequests: Array<string>, // Array of return IDs for this order
  hasActiveReturn: boolean,      // Is there an active return?
  fullyReturned: boolean,        // Is entire order returned?
  partiallyReturned: boolean,    // Are some items returned?

  // Return-related amounts
  originalAmount: number,        // Original order total
  refundedAmount: number,        // Total amount refunded
  bbmBucksRefunded: number      // BBM Bucks issued as refunds
}
```

### Products Collection Updates

```javascript
// Additional fields for product return configuration
{
  // ... existing product fields ...

  // Return configuration
  isReturnable: boolean,         // Can this product be returned?
  returnWindow: number,          // Return window in days (overrides default)
  returnRestrictions: Array<string>, // Special restrictions
  returnCategories: Array<string>    // Return policy categories
}
```

## Implementation Guide

### Step 1: Backend Setup

1. **Install Dependencies**

   ```bash
   npm install @react-native-async-storage/async-storage
   ```

2. **Create API Functions**

   ```javascript
   // util/returnsApi.js
   import { db } from "./firebaseConfig";
   // ... implement all API functions
   ```

3. **Set up Context**
   ```javascript
   // store/returns-context.js
   import { ReturnsContextProvider } from "./returns-context";
   // ... implement context and reducer
   ```

### Step 2: UI Implementation

1. **Create Components**

   ```bash
   mkdir components/Returns
   # Create all return-related components
   ```

2. **Add Navigation Routes**

   ```javascript
   // navigation/AppNavigators.js
   <UserStack.Screen name="ReturnRequestScreen" component={ReturnRequestScreen} />
   <UserStack.Screen name="ReturnsListScreen" component={ReturnsListScreen} />
   ```

3. **Integrate with Existing Screens**
   ```javascript
   // Add ReturnButton to OrderDetailsScreen and OrderDetailsModal
   ```

### Step 3: Translation Setup

1. **Add Translation Keys**
   ```javascript
   // localization/translations/en.json
   "returns": {
     // ... all return-related translations
   }
   ```

### Step 4: Context Integration

1. **Update App.js**

   ```javascript
   import { ReturnsContextProvider } from "./store/returns-context";

   // Add to context hierarchy
   <ReturnsContextProvider>// ... other providers</ReturnsContextProvider>;
   ```

### Step 5: Testing and Validation

1. **Create Test Orders**

   ```javascript
   // Use util/returnEligibilitySetup.js to set up test data
   ```

2. **Test User Flows**
   - Create return request
   - Check eligibility validation
   - Test refund calculations
   - Verify status updates

## Testing Scenarios

### Scenario 1: Full Order Return

```javascript
const testOrder = {
  id: "order-123",
  items: [
    { productId: "paint-1", quantity: 2, price: 500 },
    { productId: "brush-1", quantity: 1, price: 200 },
  ],
  total: 700,
  discount: 50,
  status: "delivered",
  deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
};

// Expected behavior:
// - Should be eligible for return
// - Full refund: ₹650 (₹700 - ₹50 discount)
// - BBM Bucks option: ₹656.50 (₹650 + 1% bonus)
```

### Scenario 2: Partial Return with Prorated Discount

```javascript
const testOrder = {
  id: "order-456",
  items: [
    { productId: "mirror-1", quantity: 1, price: 2000 },
    { productId: "hardware-1", quantity: 5, price: 100 },
  ],
  total: 2500,
  discount: 250,
  couponCode: "SAVE10",
  status: "delivered",
  deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
};

// Return mirror only (₹2000 value, 80% of order)
// Expected discount deduction: ₹200 (80% of ₹250)
// Expected refund: ₹1800 (₹2000 - ₹200)
// BBM Bucks option: ₹1818 (₹1800 + 1% bonus)
```

### Scenario 3: Expired Return Window

```javascript
const testOrder = {
  id: "order-789",
  items: [{ productId: "paint-1", quantity: 1, price: 300, category: "paint" }],
  total: 300,
  status: "delivered",
  deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
};

// Paint has 3-day return window
// Expected behavior: Not eligible - return window expired
```

### Scenario 4: Non-returnable Item

```javascript
const testOrder = {
  id: "order-101",
  items: [
    {
      productId: "toilet-1",
      quantity: 1,
      price: 500,
      category: "sanitaryware",
    },
  ],
  total: 500,
  status: "delivered",
  deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
};

// Sanitaryware is non-returnable
// Expected behavior: Not eligible - hygiene policy
```

## Error Handling

### Common Error Scenarios

1. **Network Issues**

   ```javascript
   try {
     await submitReturnRequest(data);
   } catch (error) {
     if (error.code === "network-error") {
       showToast("Please check your internet connection");
     }
   }
   ```

2. **Validation Errors**

   ```javascript
   const validation = validateReturnRequest(data);
   if (!validation.valid) {
     showErrorMessages(validation.errors);
   }
   ```

3. **Eligibility Changes**
   ```javascript
   // Re-check eligibility before submission
   const currentEligibility = await checkReturnEligibility(orderId);
   if (!currentEligibility.eligible) {
     showAlert("This order is no longer eligible for return");
   }
   ```

## Performance Considerations

### Optimization Strategies

1. **Caching**

   - Cache eligibility results for 5 minutes
   - Cache refund calculations during form session
   - Implement optimistic updates for better UX

2. **Lazy Loading**

   - Load return history on demand
   - Paginate returns list for users with many returns
   - Use FlatList with proper keyExtractor

3. **Network Optimization**
   - Batch eligibility checks for multiple orders
   - Implement retry logic for failed requests
   - Use debounced validation for real-time feedback

## Security Considerations

### Data Protection

1. **User Authorization**

   - Verify user owns the order before allowing returns
   - Implement proper authentication checks
   - Validate user permissions for return actions

2. **Data Validation**

   - Server-side validation of all return requests
   - Sanitize user input for return reasons and notes
   - Implement rate limiting for return submissions

3. **Financial Security**
   - Double-check refund calculations server-side
   - Implement approval workflow for high-value returns
   - Audit trail for all refund operations

---

_This documentation provides a complete guide to the BBM Returns System. For technical support or feature requests, please contact the development team._

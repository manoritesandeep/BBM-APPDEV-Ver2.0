# Billing Components

This directory contains all components related to the billing/checkout functionality.

## Component Structure

```
BillingScreen → BillingScreenOutput → Individual Components
```

### Main Components

- **BillingScreenOutput**: Main container component that combines all billing components
- **OrderSummary**: Displays cart items and quantities
- **DeliveryAddressSection**: Handles address selection for authenticated users
- **BillDetails**: Shows price breakdown (subtotal, tax, shipping, total)
- **PaymentMethodSection**: Displays available payment methods
- **GuestOrderModal**: Modal for guest checkout form
- **PlaceOrderFooter**: Fixed footer with place order button

### Hook

- **useBillingLogic**: Custom hook that handles all billing logic, state management, and API calls

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other screens if needed
3. **Testability**: Each component can be tested independently
4. **Maintainability**: Easier to maintain and update specific sections
5. **Readability**: Code is more organized and easier to understand

## Usage

```javascript
import BillingScreenOutput from "../components/BillingComponents/BillingScreenOutput";
import { useBillingLogic } from "../hooks/useBillingLogic";

function BillingScreen() {
  const billingProps = useBillingLogic();

  return (
    <View>
      <BillingScreenOutput {...billingProps} />
    </View>
  );
}
```

## Props Interface

### BillingScreenOutput Props

```javascript
{
  // Cart data
  cartItems: Array,

  // Billing calculations
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,

  // Authentication & Address
  isAuthenticated: Boolean,
  selectedAddress: Object,
  defaultAddress: Object,

  // Handlers
  onAddressPress: Function,
  onPlaceOrder: Function,

  // Guest modal
  guestModalVisible: Boolean,
  onCloseGuestModal: Function,
  onSubmitGuestOrder: Function,
  guestData: Object,
  onUpdateGuestData: Function,

  // Loading state
  isPlacingOrder: Boolean,
}
```

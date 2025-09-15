# BBM Payment Integration Guide

## Overview

The BBM app now supports two payment methods:

1. **Cash on Delivery (COD)** - Traditional payment on delivery
2. **Razorpay Online Payment** - Cards, UPI, Net Banking, and Wallets

## Payment Flow

### For Authenticated Users

1. User adds items to cart
2. Proceeds to billing screen
3. Selects delivery address
4. Applies coupons (if any)
5. **Selects payment method**:
   - **COD**: Order is placed immediately
   - **Razorpay**: Payment gateway opens for online payment
6. Order confirmation and tracking

### For Guest Users

1. User adds items to cart
2. Proceeds to billing screen
3. Enters guest details (name, email, phone, address)
4. **Selects payment method**:
   - **COD**: Order is placed immediately
   - **Razorpay**: Payment gateway opens for online payment
5. Order confirmation (saved with order number)

## Technical Implementation

### Payment Service (`util/paymentService.js`)

- Centralized payment processing logic
- Razorpay integration with error handling
- Payment validation and formatting utilities
- Support for retry mechanisms

### Key Components

#### 1. PaymentMethodSection

- **Location**: `components/BillingComponents/PaymentMethodSection.js`
- **Purpose**: Allows users to select between COD and Razorpay
- **Features**:
  - Radio button selection
  - Clear visual indicators
  - Payment method descriptions

#### 2. Enhanced Razorpay Component

- **Location**: `components/BillingComponents/PaymentGateway/Razorpay/Razorpay.js`
- **Purpose**: Handles online payment processing
- **Features**:
  - Payment validation
  - Loading states
  - Error handling with retry options
  - Success/failure callbacks

#### 3. Updated Billing Logic

- **Location**: `hooks/useBillingLogic.js`
- **Features**:
  - Payment method state management
  - Conditional order processing
  - Payment success/failure handling
  - Order creation with payment details

### Payment States

```javascript
export const PAYMENT_STATUS = {
  PENDING: "pending", // COD orders
  SUCCESS: "success", // Successful online payments
  FAILED: "failed", // Failed payments
  CANCELLED: "cancelled", // User cancelled payment
};
```

### Payment Methods

```javascript
export const PAYMENT_METHODS = {
  COD: "cod", // Cash on Delivery
  RAZORPAY: "razorpay", // Online payment via Razorpay
};
```

## Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```env
# Razorpay Test Configuration
RAZORPAY_API_KEY=rzp_test_your_key_here

# For production, use live keys:
# RAZORPAY_API_KEY=rzp_live_your_key_here
```

### Razorpay Setup

1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get API keys from Dashboard > Settings > API Keys
3. Configure webhook URLs for payment confirmations (optional)

## Security Features

### Payment Validation

- Amount validation before payment processing
- User information validation
- Order ID generation and tracking
- Payment signature verification (built into Razorpay)

### Error Handling

- Network failure recovery
- Payment cancellation handling
- Retry mechanisms for failed payments
- User-friendly error messages

### Data Security

- Sensitive payment data handled by Razorpay
- No payment credentials stored locally
- Secure order tracking with unique IDs

## User Experience Features

### 1. Smart Payment Selection

- COD selected by default (familiar option)
- Clear payment method descriptions
- Visual feedback for selected method

### 2. Razorpay Integration

- Test mode indicator for development
- Loading states during payment processing
- Clear success/failure messaging
- Retry options for failed payments

### 3. Order Management

- Consistent order flow regardless of payment method
- Payment method tracking in order history
- Order confirmation with payment details

## Testing

### Test Mode Features

- All payments in test mode (no real money charged)
- Test mode indicator visible to users
- Safe testing environment

### Test Cards for Razorpay

```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

## Error Scenarios and Handling

### Payment Failures

1. **Network Issues**: Retry option provided
2. **Insufficient Funds**: Clear error message
3. **Payment Cancelled**: Option to try again or switch to COD
4. **Invalid Card**: Retry with different payment method

### Order Processing

1. **Payment Success + Order Failure**:

   - Payment recorded
   - Customer support contact information provided
   - Manual order processing triggered

2. **Payment Failure**:
   - Option to retry payment
   - Option to switch to COD
   - Cart preserved for retry

## Best Practices

### For Users

- Verify payment amount before confirming
- Keep payment confirmation details
- Use strong network connection for payments
- Contact support for payment issues

### For Developers

- Always validate payment data
- Handle network failures gracefully
- Provide clear user feedback
- Log payment attempts for debugging
- Test thoroughly in test mode

## Migration from COD-only

The implementation is backward compatible:

- Existing COD flow unchanged
- New users get payment method selection
- No breaking changes to existing features

## Support and Troubleshooting

### Common Issues

1. **Payment Gateway Not Loading**: Check internet connection and API keys
2. **Payment Stuck**: Contact Razorpay support with payment ID
3. **Order Not Created**: Check Firebase connection and order API

### Contact Information

- Technical Issues: Contact development team
- Payment Issues: Contact Razorpay support
- Order Issues: Contact BBM customer care

---

**Note**: This is currently configured for test mode. Switch to live mode before production deployment.

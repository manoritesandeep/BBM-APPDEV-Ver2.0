import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../../constants/styles";
import { spacing } from "../../constants/responsive";
import { PAYMENT_METHODS } from "../../util/paymentService";

import OrderSummary from "./OrderSummary";
import DeliveryAddressSection from "./DeliveryAddressSection";
import CouponSection from "./CouponSection";
import BBMBucksRedemption from "./BBMBucks/BBMBucksRedemption";
import BBMBucksRewardDisplay from "./BBMBucks/BBMBucksRewardDisplay";
import BillDetails from "./BillDetails";
import PaymentMethodSection from "./PaymentMethodSection";
import GuestOrderModal from "./GuestOrderModal";
import PlaceOrderFooter from "./PlaceOrderFooter";
import Razorpay from "./PaymentGateway/Razorpay/Razorpay";

function BillingScreenOutput({
  // Cart data
  cartItems,

  // Billing calculations
  subtotal,
  tax,
  shipping,
  total,
  discount,
  shippingSavings,

  // Authentication & Address
  isAuthenticated,
  selectedAddress,
  defaultAddress,

  // Payment
  selectedPaymentMethod,
  onPaymentMethodSelect,
  orderDataForPayment,
  onPaymentSuccess,
  onPaymentFailure,

  // Coupon
  appliedCoupon,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  isCouponValidating,
  couponError,

  // BBM Bucks
  bbmBucksBalance = 0,
  bbmBucksRedemption = 0,
  bbmBucksDiscount = 0,
  onBBMBucksRedeem,
  onBBMBucksRemove,

  // Handlers
  onAddressPress,
  onPlaceOrder,
  onDirectPayment,
  onGstinChange,

  // Guest modal
  guestModalVisible,
  onCloseGuestModal,
  onSubmitGuestOrder,
  guestData,
  onUpdateGuestData,

  // Loading state
  isPlacingOrder,
}) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <OrderSummary items={cartItems} />

        <DeliveryAddressSection
          isAuthenticated={isAuthenticated}
          selectedAddress={selectedAddress}
          defaultAddress={defaultAddress}
          onAddressPress={onAddressPress}
        />

        <CouponSection
          appliedCoupon={appliedCoupon}
          couponCode={couponCode}
          onCouponCodeChange={onCouponCodeChange}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
          isValidating={isCouponValidating}
          error={couponError}
        />

        {/* BBM Bucks Section - Only show for authenticated users */}
        {isAuthenticated && (
          <>
            <BBMBucksRedemption
              orderAmount={total}
              categories={cartItems.map((item) => item.category)}
              onRedemptionChange={(redeemAmount, discountValue) => {
                onBBMBucksRedeem(redeemAmount);
              }}
              appliedAmount={bbmBucksRedemption}
            />

            <BBMBucksRewardDisplay orderAmount={total} cartItems={cartItems} />
          </>
        )}

        <BillDetails
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          total={total}
          discount={discount}
          shippingSavings={shippingSavings}
          bbmBucksDiscount={bbmBucksDiscount}
          onGstinChange={onGstinChange}
        />

        <PaymentMethodSection
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodSelect={onPaymentMethodSelect}
        />

        {/* Razorpay component when order data is ready */}
        {selectedPaymentMethod === PAYMENT_METHODS.RAZORPAY &&
          orderDataForPayment &&
          orderDataForPayment.paymentData &&
          orderDataForPayment.orderData && (
            <Razorpay
              amount={orderDataForPayment.paymentData.amount}
              orderId={orderDataForPayment.paymentData.orderId}
              userInfo={orderDataForPayment.paymentData.userInfo}
              onPaymentSuccess={(paymentResult) =>
                onPaymentSuccess(paymentResult, orderDataForPayment.orderData)
              }
              onPaymentFailure={onPaymentFailure}
              disabled={isPlacingOrder}
            />
          )}
      </ScrollView>

      <PlaceOrderFooter
        total={total}
        onPlaceOrder={onPlaceOrder}
        onDirectPayment={onDirectPayment}
        disabled={isPlacingOrder}
        selectedPaymentMethod={selectedPaymentMethod}
      />

      <GuestOrderModal
        visible={guestModalVisible}
        onClose={onCloseGuestModal}
        onSubmit={onSubmitGuestOrder}
        guestData={guestData}
        onUpdateGuestData={onUpdateGuestData}
      />
    </View>
  );
}

export default BillingScreenOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

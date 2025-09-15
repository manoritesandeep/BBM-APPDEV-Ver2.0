import React from "react";
import { View, StyleSheet } from "react-native";

import LoadingOverlay from "../components/UI/LoadingOverlay";
import AddressSelector from "../components/UI/AddressSelector";
import BillingScreenOutput from "../components/BillingComponents/BillingScreenOutput";
import { useBillingLogic } from "../hooks/useBillingLogic";
import { Colors } from "../constants/styles";

function BillingScreen() {
  const {
    // Data
    cartItems,
    subtotal,
    tax,
    shipping,
    total,
    discount,
    shippingSavings,
    isAuthenticated,
    selectedAddress,
    defaultAddress,
    guestData,

    // Payment data
    selectedPaymentMethod,
    orderDataForPayment,

    // Coupon data
    appliedCoupon,
    couponCode,
    isCouponValidating,
    couponError,

    // BBM Bucks data
    bbmBucksBalance,
    bbmBucksRedemption,
    bbmBucksDiscount,

    // GSTIN data
    gstinNumber,
    onGstinChange,

    // State
    isPlacingOrder,
    guestModalVisible,
    addressSelectorVisible,

    // Handlers
    handlePlaceOrder,
    handleGuestOrder,
    setSelectedAddress,
    setGuestData,
    setGuestModalVisible,
    setAddressSelectorVisible,

    // Payment handlers
    setSelectedPaymentMethod,
    handlePaymentSuccess,
    handlePaymentFailure,
    handleDirectPayment,

    // Coupon handlers
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,

    // BBM Bucks handlers
    onBBMBucksRedeem,
    onBBMBucksRemove,
  } = useBillingLogic();

  return (
    <View style={styles.container}>
      <BillingScreenOutput
        cartItems={cartItems}
        subtotal={subtotal}
        tax={tax}
        shipping={shipping}
        total={total}
        discount={discount}
        shippingSavings={shippingSavings}
        isAuthenticated={isAuthenticated}
        selectedAddress={selectedAddress}
        defaultAddress={defaultAddress}
        onAddressPress={() => setAddressSelectorVisible(true)}
        onPlaceOrder={handlePlaceOrder}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={setSelectedPaymentMethod}
        orderDataForPayment={orderDataForPayment}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        onDirectPayment={handleDirectPayment}
        guestModalVisible={guestModalVisible}
        onCloseGuestModal={() => setGuestModalVisible(false)}
        onSubmitGuestOrder={handleGuestOrder}
        guestData={guestData}
        onUpdateGuestData={setGuestData}
        isPlacingOrder={isPlacingOrder}
        appliedCoupon={appliedCoupon}
        couponCode={couponCode}
        onCouponCodeChange={onCouponCodeChange}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
        isCouponValidating={isCouponValidating}
        couponError={couponError}
        bbmBucksBalance={bbmBucksBalance}
        bbmBucksRedemption={bbmBucksRedemption}
        bbmBucksDiscount={bbmBucksDiscount}
        onBBMBucksRedeem={onBBMBucksRedeem}
        onBBMBucksRemove={onBBMBucksRemove}
        onGstinChange={onGstinChange}
      />

      {isPlacingOrder && <LoadingOverlay message="Placing order..." />}

      <AddressSelector
        visible={addressSelectorVisible}
        selectedAddress={selectedAddress}
        onAddressSelect={setSelectedAddress}
        onClose={() => setAddressSelectorVisible(false)}
      />
    </View>
  );
}

export default BillingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
});

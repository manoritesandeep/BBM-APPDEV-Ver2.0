import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Pressable,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  updateOrder,
  cancelOrder,
  fetchUserOrders,
} from "../../../util/ordersApi";
import { AuthContext } from "../../../store/auth-context";
import Button from "../../UI/Button";
import OutlinedButton from "../../UI/OutlinedButton";
import LoadingOverlay from "../../UI/LoadingOverlay";
import ReturnButton from "../../Returns/ReturnButton";
import { SafeAreaWrapper } from "../../UI/SafeAreaWrapper";
import { useToast } from "../../UI/Toast";
import FeedbackTrigger from "../../Feedback/FeedbackTrigger";
import OrderTrackingBar from "./OrderTrackingBar";
import DeliveryAddressSection from "../../BillingComponents/DeliveryAddressSection";
import {
  getReturnRequestsForOrder,
  RETURN_STATUSES,
} from "../../../util/returnsApi";

function OrderDetailsScreen({ route, navigation }) {
  const { order: initialOrder } = route.params || {};
  const [order, setOrder] = useState(initialOrder);
  const { isAuthenticated, userAddresses, userId } = useContext(AuthContext);
  const [name, setName] = useState(order?.name || order?.address?.name || "");
  const [phone, setPhone] = useState(order?.phone || "");
  const [selectedAddress, setSelectedAddress] = useState(
    order?.address || null
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    order?.deliveryInstructions || ""
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSectionCollapsed, setEditingSectionCollapsed] = useState(true);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Load return requests when component mounts or order changes
  useEffect(() => {
    if (order?.id) {
      loadReturnRequests();
    }
  }, [order?.id]);

  const loadReturnRequests = async () => {
    if (!order?.id) return;

    setLoadingReturns(true);
    try {
      const requests = await getReturnRequestsForOrder(order.id);
      setReturnRequests(requests);
    } catch (error) {
      console.error("Error loading return requests:", error);
      showToast("Failed to load return information", "error");
    } finally {
      setLoadingReturns(false);
    }
  };

  const getReturnStatusColor = (status) => {
    const statusColors = {
      pending: Colors.yellow500,
      approved: Colors.blue500,
      processing: Colors.orange500,
      completed: Colors.green500,
      refunded: Colors.success500,
      rejected: Colors.error500,
      cancelled: Colors.gray500,
    };
    return statusColors[status] || Colors.gray500;
  };

  // Determine what can be edited based on order status
  const canEditOrderDetails = ![
    "confirmed",
    "preparing",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ].includes(order?.status);
  const canEditDeliveryInfo = !["shipped", "delivered", "cancelled"].includes(
    order?.status
  );
  const canCancelOrder = !["shipped", "delivered", "cancelled"].includes(
    order?.status
  );

  // Add explicit check for debugging
  // console.log("OrderDetailsScreen - Order exists:", !!order);
  // console.log("OrderDetailsScreen - Order ID:", order?.id);
  // console.log("OrderDetailsScreen - Order Number:", order?.orderNumber);

  async function handleUpdate() {
    setLoading(true);
    try {
      const updateData = {
        "address.name": name,
        phone,
        deliveryInstructions,
      };

      // If address was changed, update address fields
      if (selectedAddress && selectedAddress !== order.address) {
        updateData.address = selectedAddress;
      }

      await updateOrder(order.id, updateData);
      showToast("Order updated successfully!", "success");
      // Navigate back and trigger refresh using navigation state
      navigation.navigate("OrdersScreen", { refresh: Date.now() });
    } catch (e) {
      showToast("Failed to update order. Please try again.", "error");
    }
    setLoading(false);
  }

  function handleAddressPress() {
    if (!canEditDeliveryInfo) {
      showToast("Address cannot be changed at this stage", "info");
      return;
    }
    // Navigate to address selection or show address modal
    setShowAddressModal(true);
  }

  function handleAddressSelect(address) {
    setSelectedAddress(address);
    setShowAddressModal(false);
    showToast("Address updated", "success");
  }

  async function handleCancel() {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await cancelOrder(order.id);
              showToast("Order cancelled successfully", "info");
              navigation.navigate("OrdersScreen", { refresh: Date.now() });
            } catch (e) {
              showToast("Failed to cancel order. Please try again.", "error");
            }
            setLoading(false);
          },
        },
      ]
    );
  }

  if (!order) {
    // console.log("OrderDetailsScreen - Order not found, showing error");
    return (
      <SafeAreaWrapper edges={["left", "right"]}>
        <Text style={styles.errorText}>Order not found</Text>
      </SafeAreaWrapper>
    );
  }

  // console.log("OrderDetailsScreen - Rendering main content for order:", order.orderNumber);

  // Calculate BBM Bucks earned for this order (if not stored)
  const calculateBBMBucksEarned = (orderTotal) => {
    // Use the same calculation logic as the service: 1% of order amount
    // This is a fallback calculation for orders that don't have stored earned amount
    return Math.floor(orderTotal * 0.01);
  };

  const bbmBucksEarned =
    order.bbmBucksEarned || calculateBBMBucksEarned(order.total || 0);

  // Handle navigation to return request screen
  const handleNavigateToReturn = (orderData) => {
    navigation.navigate("ReturnRequestScreen", { order: orderData });
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated || !order?.id || !userId) return;

    setRefreshing(true);
    try {
      // Fetch user orders and find this specific order
      const userOrders = await fetchUserOrders(userId);
      const updatedOrder = userOrders.find((o) => o.id === order.id);

      if (updatedOrder) {
        setOrder(updatedOrder);
        // Update form fields with new data
        setName(updatedOrder.name || updatedOrder.address?.name || "");
        setPhone(updatedOrder.phone || "");
        setSelectedAddress(updatedOrder.address || null);
        setDeliveryInstructions(updatedOrder.deliveryInstructions || "");
        showToast("Order details updated");

        // Also reload return requests
        await loadReturnRequests();
      }
    } catch (error) {
      console.error("Error refreshing order:", error);
      showToast("Failed to refresh order details");
    } finally {
      setRefreshing(false);
    }
  }, [order?.id, isAuthenticated, userId, showToast]);

  return (
    <SafeAreaWrapper edges={["left", "right"]} style={styles.container}>
      <ToastComponent />
      {loading && <LoadingOverlay message="Processing..." />}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Order #{order.orderNumber}</Text>

        {/* Order Tracking Bar */}
        <OrderTrackingBar order={order} />

        <Text style={styles.section}>Items:</Text>
        <View style={styles.itemsList}>
          {order.items &&
            order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder} />
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemMeta}>
                    Qty: <Text style={styles.itemQty}>{item.quantity}</Text> | ₹
                    {item.price}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        <Text style={styles.section}>Shipping Address:</Text>
        <View style={styles.addressBlock}>
          <Text>{order.address?.line1}</Text>
          {order.address?.line2 && <Text>{order.address?.line2}</Text>}
          <Text>
            {order.address?.city}, {order.address?.state} {order.address?.zip}
          </Text>
        </View>

        {/* Order Details Editing Section */}
        <View style={styles.editingSection}>
          <Pressable
            style={styles.collapsibleHeader}
            onPress={() => setEditingSectionCollapsed(!editingSectionCollapsed)}
          >
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Ionicons
              name={editingSectionCollapsed ? "chevron-down" : "chevron-up"}
              size={20}
              color={Colors.gray600}
            />
          </Pressable>

          {!editingSectionCollapsed && (
            <>
              {canEditOrderDetails ? (
                <View style={styles.editableNotice}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={Colors.primary500}
                  />
                  <Text style={styles.editableNoticeText}>
                    You can edit these details until your order is confirmed
                  </Text>
                </View>
              ) : (
                <View style={styles.lockedNotice}>
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={Colors.gray500}
                  />
                  <Text style={styles.lockedNoticeText}>
                    {canEditDeliveryInfo
                      ? "Only delivery information can be updated at this stage"
                      : "Order details are locked and cannot be changed"}
                  </Text>
                </View>
              )}

              <TextInput
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  !canEditOrderDetails && styles.inputDisabled,
                ]}
                placeholder="Name for delivery"
                editable={!loading && canEditOrderDetails}
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={[
                  styles.input,
                  !canEditOrderDetails && styles.inputDisabled,
                ]}
                placeholder="Phone number"
                keyboardType="phone-pad"
                editable={!loading && canEditOrderDetails}
              />

              {/* Delivery Address Section */}
              <View style={styles.addressSection}>
                <Text style={styles.subsectionTitle}>Delivery Address</Text>
                {isAuthenticated ? (
                  <DeliveryAddressSection
                    isAuthenticated={isAuthenticated}
                    selectedAddress={selectedAddress}
                    defaultAddress={userAddresses?.[0]}
                    onAddressPress={handleAddressPress}
                  />
                ) : (
                  <View style={styles.manualAddressContainer}>
                    <View
                      style={[
                        styles.addressBlock,
                        !canEditDeliveryInfo && styles.addressBlockDisabled,
                      ]}
                    >
                      <Text style={styles.addressText}>
                        {selectedAddress?.line1}
                      </Text>
                      {selectedAddress?.line2 && (
                        <Text style={styles.addressText}>
                          {selectedAddress?.line2}
                        </Text>
                      )}
                      <Text style={styles.addressText}>
                        {selectedAddress?.city}, {selectedAddress?.state}{" "}
                        {selectedAddress?.zip}
                      </Text>
                    </View>
                    {canEditDeliveryInfo && (
                      <Text style={styles.addressEditNote}>
                        Contact support to change delivery address
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Delivery Instructions */}
              <View style={styles.instructionsSection}>
                <Text style={styles.subsectionTitle}>
                  Delivery Instructions
                </Text>
                <TextInput
                  value={deliveryInstructions}
                  onChangeText={setDeliveryInstructions}
                  style={[
                    styles.textArea,
                    !canEditDeliveryInfo && styles.inputDisabled,
                  ]}
                  placeholder="Add special delivery instructions (e.g., gate code, preferred time, safe place)"
                  multiline
                  numberOfLines={3}
                  editable={!loading && canEditDeliveryInfo}
                  textAlignVertical="top"
                />
                {canEditDeliveryInfo && (
                  <Text style={styles.instructionsHint}>
                    These instructions will help our delivery team locate you
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Coupon Information */}
        {order.appliedCoupon && (
          <View style={styles.couponSection}>
            <Text style={styles.section}>Coupon Applied:</Text>
            <View style={styles.couponInfo}>
              <Text style={styles.couponCode}>{order.appliedCoupon.code}</Text>
              <Text style={styles.couponSavings}>
                You saved ₹
                {order.appliedCoupon.discountAmount?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>
        )}

        {/* BBM Bucks Information - Always show for orders */}
        <View style={styles.bbmBucksSection}>
          {order.bbmBucksRedeemed && order.bbmBucksRedeemed > 0 ? (
            // Show BBM Bucks used section
            <>
              <Text style={styles.section}>BBM Bucks Used:</Text>
              <View style={styles.bbmBucksInfo}>
                <View style={styles.bbmBucksHeader}>
                  <Ionicons
                    name="gift"
                    size={20}
                    color={Colors.primary500}
                    style={styles.bbmBucksIcon}
                  />
                  <Text style={styles.bbmBucksAmount}>
                    {order.bbmBucksRedeemed} BBM Bucks
                  </Text>
                </View>
                <Text style={styles.bbmBucksSavings}>
                  🎉 You saved ₹{order.bbmBucksDiscount?.toFixed(2) || "0.00"}{" "}
                  with rewards!
                </Text>
              </View>
            </>
          ) : (
            // Show BBM Bucks earned section
            <>
              <Text style={styles.section}>BBM Bucks Earned:</Text>
              <View style={styles.bbmBucksEarnedInfo}>
                <View style={styles.bbmBucksHeader}>
                  <Ionicons
                    name="star"
                    size={20}
                    color={Colors.success}
                    style={styles.bbmBucksIcon}
                  />
                  <Text style={styles.bbmBucksEarnedAmount}>
                    {bbmBucksEarned} BBM Bucks
                  </Text>
                </View>
                <Text style={styles.bbmBucksEarnedMessage}>
                  {bbmBucksEarned > 0
                    ? `🎊 You earned ₹${bbmBucksEarned.toFixed(
                        2
                      )} worth of rewards!`
                    : "💡 Start earning BBM Bucks on your next purchase!"}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.total}>
          Total: <Text style={styles.totalAmount}>₹{order.total}</Text>
        </Text>

        {/* Feedback Section - Show for completed/delivered orders */}
        {(order.status === "completed" || order.status === "delivered") && (
          <View style={styles.feedbackSection}>
            <Text style={styles.section}>Share Your Experience</Text>
            <FeedbackTrigger
              type="order"
              orderId={order.id}
              orderData={order}
              style={styles.feedbackButton}
            />
          </View>
        )}

        {order.status !== "cancelled" && (
          <View style={styles.actions}>
            {(canEditOrderDetails || canEditDeliveryInfo) && (
              <Button
                onPress={handleUpdate}
                mode="filled"
                style={styles.actionButton}
                disabled={loading}
              >
                <View style={styles.buttonContent}>
                  {loading && (
                    <Ionicons
                      name="sync"
                      size={16}
                      color={Colors.white}
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={styles.buttonText}>
                    {loading
                      ? "Updating..."
                      : canEditOrderDetails
                      ? "Update Order"
                      : "Update Delivery Info"}
                  </Text>
                </View>
              </Button>
            )}
            {canCancelOrder && (
              <OutlinedButton
                icon="close-circle"
                onPress={handleCancel}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancel Order
              </OutlinedButton>
            )}

            {/* Return Button - Show for delivered orders */}
            <ReturnButton
              order={order}
              onPress={() => handleNavigateToReturn(order)}
              variant="outline"
              style={styles.returnButton}
            />
          </View>
        )}

        {/* Return Information Section */}
        {returnRequests.length > 0 && (
          <View style={styles.returnInfoSection}>
            <Text style={styles.sectionTitle}>Return Information</Text>

            {returnRequests.map((returnRequest) => (
              <View key={returnRequest.id} style={styles.returnCard}>
                <View style={styles.returnHeader}>
                  <Text style={styles.returnNumber}>
                    #{returnRequest.returnNumber}
                  </Text>
                  <View
                    style={[
                      styles.returnStatusBadge,
                      {
                        backgroundColor: getReturnStatusColor(
                          returnRequest.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.returnStatusText}>
                      {returnRequest.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.returnDate}>
                  Submitted:{" "}
                  {new Date(returnRequest.submittedAt).toLocaleDateString()}
                </Text>

                <Text style={styles.returnReason}>
                  Reason: {returnRequest.reason}
                </Text>

                <Text style={styles.returnAmount}>
                  Refund Amount: ₹
                  {returnRequest.refundAmount?.toFixed(2) || "0.00"}
                </Text>

                <Pressable
                  style={styles.trackReturnButton}
                  onPress={() =>
                    navigation.navigate("ReturnTrackingScreen", {
                      returnNumber: returnRequest.returnNumber,
                    })
                  }
                >
                  <Ionicons
                    name="eye-outline"
                    size={16}
                    color={Colors.primary600}
                  />
                  <Text style={styles.trackReturnText}>Track Return</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {order.status === "cancelled" && (
          <View style={styles.cancelledOverlay}>
            <Text style={styles.cancelledText}>Order Cancelled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 8,
    paddingTop: 4,
    paddingBottom: 4, // Minimal bottom padding for better space utilization
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.accent500,
    marginTop: 50,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
    color: Colors.accent500,
  },

  // Editing Section
  editingSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray800,
    marginBottom: 8,
    marginTop: 16,
  },
  editableNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  editableNoticeText: {
    fontSize: 12,
    color: Colors.primary600,
    marginLeft: 8,
    flex: 1,
  },
  lockedNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gray400,
  },
  lockedNoticeText: {
    fontSize: 12,
    color: Colors.gray600,
    marginLeft: 8,
    flex: 1,
  },

  // Address Section
  addressSection: {
    marginTop: 8,
  },
  manualAddressContainer: {
    marginTop: 8,
  },
  addressBlockDisabled: {
    opacity: 0.6,
  },
  addressEditNote: {
    fontSize: 12,
    color: Colors.primary500,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },

  // Instructions Section
  instructionsSection: {
    marginTop: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: Colors.white,
    minHeight: 80,
    textAlignVertical: "top",
  },
  instructionsHint: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 4,
    fontStyle: "italic",
  },

  greyedOut: {
    opacity: 0.75,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    fontSize: 14,
    backgroundColor: Colors.white,
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    color: Colors.gray500,
  },
  section: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    fontSize: 16,
    color: Colors.gray900,
  },
  itemsList: {
    marginBottom: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: "#eee",
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: "#e0e0e0",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: Colors.gray700,
  },
  itemQty: {
    fontWeight: "bold",
    color: Colors.gray900,
  },
  addressBlock: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 6,
    marginBottom: 10,
  },
  couponSection: {
    marginBottom: 10,
  },
  couponInfo: {
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    padding: 6,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  couponCode: {
    fontWeight: "bold",
    color: Colors.success,
    fontSize: 16,
    marginBottom: 4,
  },
  couponSavings: {
    color: Colors.success,
    fontSize: 14,
    fontStyle: "italic",
  },
  bbmBucksSection: {
    marginBottom: 8,
  },
  bbmBucksInfo: {
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    padding: 6,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  bbmBucksHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bbmBucksIcon: {
    marginRight: 8,
  },
  bbmBucksAmount: {
    fontWeight: "bold",
    color: Colors.primary500,
    fontSize: 16,
  },
  bbmBucksSavings: {
    color: Colors.primary600,
    fontSize: 14,
    fontStyle: "italic",
  },
  bbmBucksEarnedInfo: {
    backgroundColor: "#f0fff4",
    borderRadius: 8,
    padding: 6,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  bbmBucksEarnedAmount: {
    fontWeight: "bold",
    color: Colors.success,
    fontSize: 16,
  },
  bbmBucksEarnedMessage: {
    color: Colors.gray700,
    fontSize: 13,
    fontStyle: "italic",
  },
  total: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
    color: Colors.gray900,
  },
  totalAmount: {
    color: Colors.accent700,
    fontSize: 18,
  },
  actions: {
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: Colors.primary500,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    borderColor: Colors.accent500,
  },
  cancelledOverlay: {
    marginTop: 14,
    backgroundColor: "rgba(220,220,220,0.8)",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  cancelledText: {
    fontSize: 20,
    color: Colors.gray700,
    fontWeight: "bold",
  },
  feedbackSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  feedbackButton: {
    marginTop: 8,
  },
  returnButton: {
    marginTop: 8,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  returnInfoSection: {
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  returnCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  returnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  returnNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
  },
  returnStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  returnStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  returnDate: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 4,
  },
  returnReason: {
    fontSize: 14,
    color: Colors.gray700,
    marginBottom: 4,
  },
  returnAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.success600,
    marginBottom: 8,
  },
  trackReturnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary50,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  trackReturnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary600,
    marginLeft: 6,
  },
});

export default OrderDetailsScreen;

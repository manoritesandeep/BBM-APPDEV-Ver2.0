import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { updateOrder, cancelOrder } from "../../../util/ordersApi";
import { AuthContext } from "../../../store/auth-context";
import Button from "../../UI/Button";
import OutlinedButton from "../../UI/OutlinedButton";
import IconButton from "../../UI/IconButton";
import LoadingOverlay from "../../UI/LoadingOverlay";
import SafeAreaWrapper from "../../UI/SafeAreaWrapper";
import { useToast } from "../../UI/ToastProvider";
import OrderTrackingBar from "./OrderTrackingBar";
import DeliveryAddressSection from "../../BillingComponents/DeliveryAddressSection";
import { useI18n } from "../../../store/i18n-context";
import ReturnButton from "../../Returns/ReturnButton";

function OrderDetailsModal({
  visible,
  order,
  onClose,
  onOrderUpdated,
  onNavigateToReturn,
}) {
  const { t } = useI18n();
  // Early return if order is invalid
  if (!order || typeof order !== "object") {
    return null;
  }

  // Debug log to see order structure
  // console.log("OrderDetailsModal order:", JSON.stringify(order, null, 2));

  const { isAuthenticated, userAddresses } = useContext(AuthContext);

  // Safely extract name - handle both string and object address formats
  const orderName =
    order?.name ||
    (typeof order?.address?.name === "string" ? order?.address?.name : "") ||
    "";

  const [name, setName] = useState(orderName);
  const [phone, setPhone] = useState(String(order?.phone || ""));
  const [selectedAddress, setSelectedAddress] = useState(
    order?.address || null
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    String(order?.deliveryInstructions || "")
  );
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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

  async function handleUpdate() {
    setLoading(true);
    try {
      const updateData = {};

      if (canEditOrderDetails) {
        updateData.phone = phone;
        if (selectedAddress) {
          updateData.address = selectedAddress;
        }
      }

      if (canEditDeliveryInfo) {
        updateData.deliveryInstructions = deliveryInstructions;
        if (
          selectedAddress &&
          order?.address?.formattedAddress !== selectedAddress?.formattedAddress
        ) {
          updateData.address = selectedAddress;
        }
      }

      await updateOrder(order.id, updateData);
      onOrderUpdated();
      showToast(t("orders.orderUpdatedSuccessfully"), "success");
    } catch (e) {
      showToast(t("orders.couldNotUpdateOrder"), "error");
    }
    setLoading(false);
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelOrder(order.id);
      onOrderUpdated();
      showToast(t("orders.orderCancelledInfo"), "info");
    } catch (e) {
      showToast(t("orders.couldNotCancelOrder"), "error");
    }
    setLoading(false);
  }

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* <SafeAreaWrapper edges={["bottom"]}> */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t("orders.orderDetails")} #{String(order.orderNumber || "")}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray700} />
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <LoadingOverlay message={t("orders.processing")} />
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={order.status === "cancelled" ? styles.greyedOut : null}>
            <Text style={styles.title}>
              {t("orders.orderDetails")} #{String(order.orderNumber || "")}
            </Text>

            {/* Order Tracking Bar */}
            <OrderTrackingBar order={order} />

            {canEditOrderDetails && (
              <>
                <Text style={styles.section}>
                  {t("orders.orderInformation")}:
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  placeholder={t("user.phoneNumber")}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </>
            )}

            {canEditDeliveryInfo && (
              <>
                <Text style={styles.section}>
                  {t("orders.deliveryAddress")}:
                </Text>
                {isAuthenticated ? (
                  <DeliveryAddressSection
                    selectedAddress={selectedAddress}
                    onAddressChange={setSelectedAddress}
                    userAddresses={userAddresses}
                    isAuthenticated={isAuthenticated}
                  />
                ) : (
                  <View style={styles.guestAddressSection}>
                    <Text style={styles.guestAddressNote}>
                      {t("orders.guestAddressNote")}
                    </Text>
                  </View>
                )}

                <Text style={styles.section}>
                  {t("orders.deliveryInstructions")}:
                </Text>
                <TextInput
                  value={deliveryInstructions}
                  onChangeText={setDeliveryInstructions}
                  style={[styles.input, styles.deliveryInstructionsInput]}
                  placeholder={t("orders.addDeliveryInstructions")}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                />
              </>
            )}

            {!canEditOrderDetails && !canEditDeliveryInfo && (
              <>
                <Text style={styles.section}>
                  {t("orders.contactInformation")}:
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t("user.phoneNumber")}:</Text>
                  <Text style={styles.infoValue}>
                    {String(order.phone || "")}
                  </Text>
                </View>
              </>
            )}
            <Text style={styles.section}>{t("orders.items")}:</Text>
            <View style={styles.itemsList}>
              {order.items.map((item, idx) => (
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
                    <Text style={styles.itemName}>
                      {String(item.productName || "")}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {t("orders.quantity")}:{" "}
                      <Text style={styles.itemQty}>
                        {String(item.quantity || "")}
                      </Text>{" "}
                      | ₹{String(item.price || "")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.section}>{t("orders.shippingAddress")}:</Text>
            <View style={styles.addressBlock}>
              <Text>
                {String(
                  selectedAddress?.line1 || order.address?.line1 || "N/A"
                )}
              </Text>
              {(selectedAddress?.line2 || order.address?.line2) && (
                <Text>
                  {String(selectedAddress?.line2 || order.address?.line2)}
                </Text>
              )}
              <Text>
                {String(selectedAddress?.city || order.address?.city || "")},{" "}
                {String(selectedAddress?.state || order.address?.state || "")}{" "}
                {String(selectedAddress?.zip || order.address?.zip || "")}
              </Text>
            </View>

            {deliveryInstructions && (
              <>
                <Text style={styles.section}>
                  {t("orders.deliveryInstructions")}:
                </Text>
                <View style={styles.addressBlock}>
                  <Text>{String(deliveryInstructions)}</Text>
                </View>
              </>
            )}

            {/* Coupon Information */}
            {order.appliedCoupon && (
              <View style={styles.couponSection}>
                <Text style={styles.section}>{t("orders.couponApplied")}:</Text>
                <View style={styles.couponInfo}>
                  <Text style={styles.couponCode}>
                    {String(order.appliedCoupon.code || "")}
                  </Text>
                  <Text style={styles.couponSavings}>
                    {t("orders.youSaved")} ₹
                    {String(
                      order.appliedCoupon.discountAmount?.toFixed(2) || "0.00"
                    )}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.total}>
              {t("user.orderTotal")}:{" "}
              <Text style={styles.totalAmount}>
                ₹{String(order.total || "")}
              </Text>
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {(canEditOrderDetails || canEditDeliveryInfo) && (
                <>
                  <Button
                    onPress={handleUpdate}
                    mode="contained"
                    style={styles.actionButton}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>
                      {t("orders.update")}
                    </Text>
                  </Button>
                  {canCancelOrder && (
                    <OutlinedButton
                      icon="close-circle"
                      onPress={handleCancel}
                      disabled={loading}
                    >
                      {t("orders.cancel")}
                    </OutlinedButton>
                  )}
                </>
              )}

              {/* Return Button - Show for delivered orders */}
              <ReturnButton
                order={order}
                onPress={() => {
                  onClose(); // Close the modal first
                  // Navigate to return request screen
                  // Note: You'll need to pass navigation prop to this component
                  if (onNavigateToReturn) {
                    onNavigateToReturn(order);
                  }
                }}
                variant="outline"
                style={styles.returnButton}
              />
            </View>
            {order.status === "cancelled" && (
              <View style={styles.cancelledOverlay}>
                <Text style={styles.cancelledText}>
                  {t("orders.orderCancelled")}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {/* </SafeAreaWrapper> */}
    </Modal>
  );
}

export default OrderDetailsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.gray700,
  },
  closeButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: Colors.gray200,
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  greyedOut: {
    opacity: 0.6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    marginRight: 16,
    textAlign: "left",
    color: Colors.accent500,
  },
  greyedOut: {
    opacity: 0.75,
  },
  cancelledOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(220,220,220,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    zIndex: 20,
  },
  cancelledText: {
    fontSize: 22,
    color: Colors.gray700,
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 16,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  section: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    fontSize: 15,
    color: Colors.primary600,
  },
  deliveryInstructionsInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  infoLabel: {
    fontWeight: "600",
    minWidth: 80,
    color: Colors.gray700,
  },
  infoValue: {
    flex: 1,
    color: Colors.gray900,
  },
  guestAddressSection: {
    backgroundColor: Colors.gray50,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  guestAddressNote: {
    color: Colors.gray600,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  itemsList: {
    marginBottom: 8,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary700,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 13,
    color: Colors.gray700,
  },
  itemQty: {
    fontWeight: "bold",
    color: Colors.primary500,
  },
  addressBlock: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  couponSection: {
    marginBottom: 12,
  },
  couponInfo: {
    backgroundColor: "#e8f5e8",
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  couponCode: {
    fontWeight: "bold",
    color: Colors.success,
    fontSize: 14,
    marginBottom: 2,
  },
  couponSavings: {
    color: Colors.success,
    fontSize: 12,
    fontStyle: "italic",
  },
  total: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    textAlign: "right",
  },
  totalAmount: {
    color: Colors.primary700,
    fontSize: 17,
  },
  actions: {
    flexDirection: "column",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  returnButton: {
    marginTop: 8,
  },
});

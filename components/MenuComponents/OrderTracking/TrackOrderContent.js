import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import OrderDetailsModal from "../../UserComponents/Orders/OrderDetailsModal";
import { Colors } from "../../../constants/styles";
import { useOrderTracking } from "../../../hooks/useOrderTracking";
import { useTheme } from "../../../store/theme-context";
import { useI18n } from "../../../store/i18n-context";

// Helper function to get status color
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "placed":
    case "confirmed":
      return Colors.primary300; // Yellow
    case "preparing":
    case "processing":
      return "#ff9800"; // Orange
    case "shipped":
    case "out for delivery":
      return "#2196f3"; // Blue
    case "delivered":
      return "#4caf50"; // Green
    case "cancelled":
      return "#f44336"; // Red
    default:
      return Colors.gray500; // Gray
  }
}

function TrackOrderContent() {
  const { colors } = useTheme();
  const {
    // Form state
    orderNumber,
    setOrderNumber,
    email,
    setEmail,
    loading,

    // Order state
    order,
    showDetails,

    // Recent orders
    recentOrders,
    loadingRecentOrders,
    recentOrdersExpanded,

    // Saved data
    savedEmails,

    // Copy functionality
    copiedOrderNumber,

    // Actions
    trackOrder,
    selectRecentOrder,
    quickFillEmail,
    handleCopyOrderNumber,
    toggleRecentOrders,
    clearForm,
    closeOrderDetails,
    refreshRecentOrders,

    // Auth state
    isAuthenticated,
  } = useOrderTracking();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.contentBox}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="search" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.contentTitle}>Track Your Order</Text>
            <Text style={styles.subtitle}>
              Enter your order details to track status and delivery
            </Text>
          </View>
        </View>

        {/* Tracking Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>Order Number</Text>
              {orderNumber.trim() && (
                <Pressable
                  style={styles.copyInputButton}
                  onPress={() => handleCopyOrderNumber(orderNumber)}
                >
                  {copiedOrderNumber === orderNumber ? (
                    <Ionicons name="checkmark" size={14} color="#4caf50" />
                  ) : (
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color={Colors.secondary500}
                    />
                  )}
                  <Text style={styles.copyInputText}>
                    {copiedOrderNumber === orderNumber ? "Copied!" : "Copy"}
                  </Text>
                </Pressable>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. BBM-1234567890-123"
              value={orderNumber}
              onChangeText={setOrderNumber}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              accessibilityLabel="Order Number"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              {savedEmails.length > 0 && (
                <Text style={styles.quickFillHint}>Tap to use recent</Text>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Email"
              autoCapitalize="none"
            />

            {/* Quick fill emails */}
            {savedEmails.length > 0 && (
              <View style={styles.quickFillContainer}>
                {savedEmails.map((savedEmail, index) => (
                  <Pressable
                    key={index}
                    style={styles.quickFillButton}
                    onPress={() => quickFillEmail(savedEmail)}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={14}
                      color={Colors.secondary500}
                    />
                    <Text style={styles.quickFillText}>{savedEmail}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.trackButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={trackOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Track Order</Text>
                </>
              )}
            </Pressable>

            <Pressable style={styles.clearButton} onPress={clearForm}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Orders Section (for authenticated users) */}
        {isAuthenticated && (
          <View style={styles.recentOrdersContainer}>
            <Pressable
              style={styles.sectionHeader}
              onPress={toggleRecentOrders}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.secondary500}
                />
                <Text style={styles.sectionTitle}>Your Recent Orders</Text>
                {recentOrders.length > 0 && (
                  <View style={styles.orderCountBadge}>
                    <Text style={styles.orderCountText}>
                      {recentOrders.length}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                {recentOrdersExpanded && (
                  <Pressable
                    style={styles.refreshButton}
                    onPress={() => refreshRecentOrders()}
                    disabled={loadingRecentOrders}
                  >
                    <Ionicons
                      name="refresh"
                      size={16}
                      color={Colors.secondary500}
                      style={[loadingRecentOrders && styles.rotating]}
                    />
                  </Pressable>
                )}
                <Ionicons
                  name={recentOrdersExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={Colors.secondary500}
                />
              </View>
            </Pressable>

            {recentOrdersExpanded && (
              <>
                {loadingRecentOrders ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={Colors.secondary500}
                    />
                    <Text style={styles.loadingText}>
                      Loading recent orders...
                    </Text>
                  </View>
                ) : recentOrders.length > 0 ? (
                  <View style={styles.recentOrdersList}>
                    {recentOrders.map((recentOrder, index) => (
                      <View key={index} style={styles.recentOrderItem}>
                        <Pressable
                          style={styles.orderMainContent}
                          onPress={() => selectRecentOrder(recentOrder)}
                        >
                          <View style={styles.recentOrderInfo}>
                            <Text style={styles.recentOrderNumber}>
                              {recentOrder.orderNumber}
                            </Text>
                            <View style={styles.statusContainer}>
                              <View
                                style={[
                                  styles.statusIndicator,
                                  {
                                    backgroundColor: getStatusColor(
                                      recentOrder.status
                                    ),
                                  },
                                ]}
                              />
                              <Text style={styles.recentOrderStatus}>
                                {recentOrder.status || "Processing"}
                              </Text>
                            </View>
                          </View>
                          <Ionicons
                            name="eye-outline"
                            size={18}
                            color={Colors.gray500}
                          />
                        </Pressable>
                        <Pressable
                          style={styles.copyOrderButton}
                          onPress={() =>
                            handleCopyOrderNumber(recentOrder.orderNumber)
                          }
                        >
                          {copiedOrderNumber === recentOrder.orderNumber ? (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#4caf50"
                            />
                          ) : (
                            <Ionicons
                              name="copy-outline"
                              size={16}
                              color={Colors.secondary500}
                            />
                          )}
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noOrdersContainer}>
                    <Text style={styles.noOrdersText}>
                      No recent orders found
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Order numbers start with "BBM-" followed by numbers
          </Text>
          <Text style={styles.tipText}>
            • Use the same email address used when placing the order
          </Text>
          <Text style={styles.tipText}>
            • Tap copy buttons to copy order numbers for easy sharing
          </Text>
          <Text style={styles.tipText}>
            • Check your email for order confirmation details
          </Text>
        </View>
      </View>

      {/* Order Details Modal */}
      <OrderDetailsModal
        visible={showDetails}
        order={order}
        onClose={closeOrderDetails}
        onOrderUpdated={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 4,
    margin: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },

  // Header Styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    backgroundColor: Colors.secondary500,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary500,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 20,
  },

  // Form Styles
  formContainer: {
    marginBottom: 14,
  },
  inputContainer: {
    marginBottom: 14,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray700,
  },
  quickFillHint: {
    fontSize: 12,
    color: Colors.secondary500,
    fontStyle: "italic",
  },
  copyInputButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary500,
    gap: 4,
  },
  copyInputText: {
    fontSize: 12,
    color: Colors.secondary500,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  // Quick Fill Styles
  quickFillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 8,
  },
  quickFillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent200,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary500,
  },
  quickFillText: {
    fontSize: 12,
    color: Colors.secondary500,
    marginLeft: 4,
    fontWeight: "500",
  },

  // Button Styles
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  trackButton: {
    backgroundColor: Colors.secondary500,
    shadowColor: Colors.secondary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  clearButton: {
    backgroundColor: Colors.gray300,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: Colors.gray700,
    fontWeight: "600",
    fontSize: 13,
  },

  // Recent Orders Styles
  recentOrdersContainer: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondary500,
    marginLeft: 8,
  },
  orderCountBadge: {
    backgroundColor: Colors.secondary500,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  orderCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#f0f8ff",
  },
  rotating: {
    // Note: In a real app, you'd add animation here
    // transform: [{ rotate: "45deg" }],
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.gray700,
    fontSize: 14,
  },
  recentOrdersList: {
    gap: 8,
  },
  recentOrderItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  orderMainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  recentOrderInfo: {
    flex: 1,
  },
  copyOrderButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentOrderNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondary500,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recentOrderStatus: {
    fontSize: 14,
    color: Colors.gray600,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  noOrdersContainer: {
    alignItems: "center",
    paddingVertical: 14,
  },
  noOrdersText: {
    fontSize: 14,
    color: Colors.gray600,
    fontStyle: "italic",
  },

  // Tips Styles
  tipsContainer: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary500,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondary500,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: Colors.gray700,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default TrackOrderContent;

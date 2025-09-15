import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";
import { useReturns } from "../../store/returns-context";
import { AuthContext } from "../../store/auth-context";
import SafeAreaWrapper from "../UI/SafeAreaWrapper";
import LoadingState from "../UI/LoadingState";

const RETURN_STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    color: Colors.orange500,
    backgroundColor: Colors.orange50,
    icon: "time-outline",
  },
  approved: {
    label: "Approved",
    color: Colors.blue500,
    backgroundColor: Colors.blue50,
    icon: "checkmark-circle-outline",
  },
  rejected: {
    label: "Rejected",
    color: Colors.error500,
    backgroundColor: Colors.error50,
    icon: "close-circle-outline",
  },
  processing: {
    label: "Processing",
    color: Colors.purple500,
    backgroundColor: Colors.purple50,
    icon: "sync-outline",
  },
  completed: {
    label: "Completed",
    color: Colors.success500,
    backgroundColor: Colors.success50,
    icon: "checkmark-done-outline",
  },
  refunded: {
    label: "Refunded",
    color: Colors.success600,
    backgroundColor: Colors.success50,
    icon: "card-outline",
  },
  cancelled: {
    label: "Cancelled",
    color: Colors.gray500,
    backgroundColor: Colors.gray50,
    icon: "ban-outline",
  },
};

function ReturnsListScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const { returnRequests, isLoading, error, fetchReturnRequests } =
    useReturns();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadReturnRequests();
    }
  }, [userId]);

  const loadReturnRequests = async () => {
    try {
      await fetchReturnRequests(userId);
    } catch (error) {
      console.error("Error loading return requests:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReturnRequests();
    setRefreshing(false);
  };

  const handleReturnPress = (returnRequest) => {
    navigation.navigate("ReturnTrackingScreen", {
      returnNumber: returnRequest.returnNumber,
    });
  };

  const renderReturnItem = ({ item }) => {
    const status =
      RETURN_STATUS_CONFIG[item.status] || RETURN_STATUS_CONFIG.pending;
    const submittedDate = new Date(item.submittedAt.seconds * 1000);
    const totalItems = item.items.reduce(
      (sum, returnItem) => sum + returnItem.quantity,
      0
    );

    return (
      <Pressable
        style={({ pressed }) => [
          styles.returnCard,
          pressed && styles.returnCardPressed,
        ]}
        onPress={() => handleReturnPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.returnNumber}>{item.returnNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.backgroundColor },
            ]}
          >
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.submittedDate}>
          Submitted: {submittedDate.toLocaleDateString()}
        </Text>

        <View style={styles.returnInfo}>
          <Text style={styles.itemsCount}>
            {totalItems} item{totalItems > 1 ? "s" : ""} • ₹
            {item.refundAmount.toFixed(2)}
          </Text>
          <Text style={styles.refundMethod}>
            {item.refundMethod === "bbm_bucks"
              ? "BBM Bucks"
              : "Original Payment"}
          </Text>
        </View>

        {/* Items preview */}
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 2).map((returnItem, index) => (
            <Text key={index} style={styles.itemPreview} numberOfLines={1}>
              • {returnItem.productName} (×{returnItem.quantity})
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} more item
              {item.items.length - 2 > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetails}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
        </View>
      </Pressable>
    );
  };

  if (isLoading && returnRequests.length === 0) {
    return <LoadingState message="Loading your return requests..." />;
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </Pressable>
          <Text style={styles.headerTitle}>Return Requests</Text>
          <View style={styles.placeholder} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.error500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {returnRequests.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="return-down-back-outline"
              size={64}
              color={Colors.gray400}
            />
            <Text style={styles.emptyTitle}>No Return Requests</Text>
            <Text style={styles.emptyMessage}>
              You haven't submitted any return requests yet. When you do,
              they'll appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={returnRequests}
            renderItem={renderReturnItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary500]}
                tintColor={Colors.primary500}
              />
            }
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.heading3,
    color: Colors.gray900,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error50,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: scaleSize(8),
  },
  errorText: {
    ...typography.body2,
    color: Colors.error700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  returnCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.lg,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  returnCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  returnNumber: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.primary600,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: scaleSize(12),
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  submittedDate: {
    ...typography.body2,
    color: Colors.gray600,
    marginBottom: spacing.sm,
  },
  returnInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  itemsCount: {
    ...typography.body2,
    fontWeight: "500",
    color: Colors.gray900,
  },
  refundMethod: {
    ...typography.caption,
    color: Colors.gray600,
  },
  itemsPreview: {
    marginBottom: spacing.md,
  },
  itemPreview: {
    ...typography.caption,
    color: Colors.gray700,
    marginBottom: spacing.xs / 2,
  },
  moreItems: {
    ...typography.caption,
    color: Colors.primary600,
    fontWeight: "500",
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetails: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading3,
    color: Colors.gray700,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
  },
});

export default ReturnsListScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";
import LoadingOverlay from "../UI/LoadingOverlay";
import Button from "../UI/Button";
import { getReturnDetails, cancelReturnRequest } from "../../util/returnsApi";

const RETURN_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const STATUS_TIMELINE = [
  {
    key: RETURN_STATUSES.PENDING,
    label: "Return Requested",
    description: "Your return request has been submitted",
    icon: "checkmark-circle",
  },
  {
    key: RETURN_STATUSES.APPROVED,
    label: "Return Approved",
    description: "Your return has been approved",
    icon: "thumbs-up",
  },
  {
    key: RETURN_STATUSES.PROCESSING,
    label: "Processing Return",
    description: "We're processing your return",
    icon: "construct",
  },
  {
    key: RETURN_STATUSES.COMPLETED,
    label: "Return Completed",
    description: "Your items have been received",
    icon: "cube",
  },
  {
    key: RETURN_STATUSES.REFUNDED,
    label: "Refund Processed",
    description: "Your refund has been processed",
    icon: "card",
  },
];

function ReturnTrackingScreen({ route, navigation }) {
  const { returnNumber } = route.params;
  const [returnDetails, setReturnDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [returnNumber]);

  const fetchReturnDetails = async () => {
    try {
      setError(null);
      const details = await getReturnDetails(returnNumber);
      setReturnDetails(details);
    } catch (err) {
      console.error("Error fetching return details:", err);
      setError("Failed to load return details");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReturnDetails();
  };

  const getStatusIndex = (status) => {
    return STATUS_TIMELINE.findIndex((s) => s.key === status);
  };

  const isStatusCompleted = (status, currentStatus) => {
    const statusIndex = getStatusIndex(status);
    const currentIndex = getStatusIndex(currentStatus);
    return statusIndex <= currentIndex;
  };

  const isStatusActive = (status, currentStatus) => {
    return status === currentStatus;
  };

  const getStatusDate = (status) => {
    if (!returnDetails?.statusHistory) return null;
    const historyItem = returnDetails.statusHistory.find(
      (h) => h.status === status
    );
    return historyItem?.timestamp?.toDate?.() || historyItem?.timestamp;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelReturn = () => {
    Alert.alert(
      "Cancel Return Request",
      "Are you sure you want to cancel this return request? This action cannot be undone.",
      [
        {
          text: "No, Keep Request",
          style: "cancel",
        },
        {
          text: "Yes, Cancel Request",
          style: "destructive",
          onPress: confirmCancelReturn,
        },
      ]
    );
  };

  const confirmCancelReturn = async () => {
    setIsCancelling(true);
    try {
      await cancelReturnRequest(returnDetails.id, returnDetails.userId);

      Alert.alert(
        "Return Cancelled",
        "Your return request has been cancelled successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh the details to show updated status
              fetchReturnDetails();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling return:", error);
      Alert.alert(
        "Cancel Failed",
        error.message || "Failed to cancel return request. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading return details..." />;
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error500} />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button onPress={fetchReturnDetails} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!returnDetails) {
    return (
      <SafeAreaWrapper>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.notFoundContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Modern Not Found Design */}
          <View style={styles.notFoundCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons
                  name="search-outline"
                  size={scaleSize(64)}
                  color={Colors.primary500}
                />
              </View>
            </View>

            <Text style={styles.notFoundTitle}>Return Not Found</Text>
            <Text style={styles.notFoundSubtitle}>
              We couldn't find a return with number:
            </Text>

            <View style={styles.returnNumberBox}>
              <Text style={styles.returnNumberText}>#{returnNumber}</Text>
            </View>

            <Text style={styles.notFoundDescription}>
              This could happen if:
            </Text>

            <View style={styles.reasonsList}>
              <View style={styles.reasonItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.orange500}
                />
                <Text style={styles.reasonText}>
                  Return request is still being processed
                </Text>
              </View>
              <View style={styles.reasonItem}>
                <Ionicons
                  name="sync-outline"
                  size={20}
                  color={Colors.blue500}
                />
                <Text style={styles.reasonText}>
                  System is updating, try refreshing
                </Text>
              </View>
              <View style={styles.reasonItem}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={Colors.yellow600}
                />
                <Text style={styles.reasonText}>
                  Return number was entered incorrectly
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Button onPress={onRefresh} style={styles.refreshButton}>
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={Colors.white}
                  />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </View>
              </Button>

              <Button
                onPress={() => navigation.navigate("ReturnsListScreen")}
                style={styles.viewAllButton}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="list-outline"
                    size={18}
                    color={Colors.white}
                  />
                  <Text style={styles.viewAllButtonText}>View All Returns</Text>
                </View>
              </Button>

              <Button
                onPress={() => navigation.goBack()}
                style={styles.goBackButton}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="arrow-back-outline"
                    size={18}
                    color={Colors.primary600}
                  />
                  <Text style={styles.goBackButtonText}>Go Back</Text>
                </View>
              </Button>
            </View>

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={Colors.primary500}
              />
              <Text style={styles.helpText}>
                Need help? Contact our support team for assistance with your
                return.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.returnNumber}>Return #{returnNumber}</Text>
          <Text style={styles.orderNumber}>
            Order #{returnDetails.orderNumber}
          </Text>
        </View>

        {/* Current Status */}
        <View style={styles.currentStatusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons
              name={
                STATUS_TIMELINE.find((s) => s.key === returnDetails.status)
                  ?.icon || "help-circle"
              }
              size={32}
              color={Colors.accent700}
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.currentStatusLabel}>Current Status</Text>
            <Text style={styles.currentStatusValue}>
              {STATUS_TIMELINE.find((s) => s.key === returnDetails.status)
                ?.label || returnDetails.status}
            </Text>
            <Text style={styles.statusDescription}>
              {STATUS_TIMELINE.find((s) => s.key === returnDetails.status)
                ?.description || "Status update"}
            </Text>
          </View>
        </View>

        {/* Cancel Button (only show for pending returns) */}
        {returnDetails.status === RETURN_STATUSES.PENDING && (
          <View style={styles.cancelButtonContainer}>
            <Button
              onPress={handleCancelReturn}
              style={styles.cancelButton}
              disabled={isCancelling}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={Colors.error500}
                />
                <Text style={styles.cancelButtonText}>
                  {isCancelling ? "Cancelling..." : "Cancel Return Request"}
                </Text>
              </View>
            </Button>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Return Progress</Text>
          {STATUS_TIMELINE.map((statusItem, index) => {
            const isCompleted = isStatusCompleted(
              statusItem.key,
              returnDetails.status
            );
            const isActive = isStatusActive(
              statusItem.key,
              returnDetails.status
            );
            const statusDate = getStatusDate(statusItem.key);

            return (
              <View key={statusItem.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIcon,
                      isCompleted && styles.timelineIconCompleted,
                      isActive && styles.timelineIconActive,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? "checkmark" : statusItem.icon}
                      size={16}
                      color={
                        isCompleted || isActive ? Colors.white : Colors.gray400
                      }
                    />
                  </View>
                  {index < STATUS_TIMELINE.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                        isActive && styles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isActive && styles.timelineLabelActive,
                    ]}
                  >
                    {statusItem.label}
                  </Text>
                  <Text style={styles.timelineDescription}>
                    {statusItem.description}
                  </Text>
                  {statusDate && (
                    <Text style={styles.timelineDate}>
                      {formatDate(statusDate)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Return Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Return Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Return Method:</Text>
            <Text style={styles.detailValue}>
              {returnDetails.refundMethod === "bbm_bucks"
                ? "BBM Bucks"
                : returnDetails.refundMethod === "original_payment"
                ? "Original Payment"
                : returnDetails.refundMethod}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Refund Amount:</Text>
            <Text style={styles.detailValue}>
              ₹{returnDetails.refundAmount?.toFixed(2) || "0.00"}
            </Text>
          </View>

          {returnDetails.refundMethod === "bbm_bucks" &&
            returnDetails.bbmBucksAmount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>BBM Bucks:</Text>
                <Text style={styles.detailValue}>
                  {returnDetails.bbmBucksAmount} BBM Bucks
                </Text>
              </View>
            )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason:</Text>
            <Text style={styles.detailValue}>
              {returnDetails.reason || "Not specified"}
            </Text>
          </View>

          {returnDetails.customReason && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Additional Details:</Text>
              <Text style={styles.detailValue}>
                {returnDetails.customReason}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>
              {returnDetails.items?.length || 0} item(s)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  returnNumber: {
    ...typography.h3,
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  orderNumber: {
    ...typography.body,
    color: Colors.gray600,
  },
  currentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: Colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.elevation,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  currentStatusLabel: {
    ...typography.bodySmall,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  currentStatusValue: {
    ...typography.h4,
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  statusDescription: {
    ...typography.body,
    color: Colors.gray600,
  },
  timelineContainer: {
    padding: spacing.lg,
    backgroundColor: Colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.elevation,
  },
  sectionTitle: {
    ...typography.h4,
    color: Colors.gray900,
    marginBottom: spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconCompleted: {
    backgroundColor: Colors.success500,
  },
  timelineIconActive: {
    backgroundColor: Colors.accent700,
  },
  timelineLine: {
    width: 3,
    height: 32,
    backgroundColor: Colors.gray200,
    marginTop: spacing.sm,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success500,
  },
  timelineLineActive: {
    backgroundColor: Colors.accent700,
  },
  timelineRight: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  timelineLabel: {
    ...typography.bodyBold,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  timelineLabelCompleted: {
    color: Colors.success700,
  },
  timelineLabelActive: {
    color: Colors.accent700,
    fontWeight: "bold",
  },
  timelineDescription: {
    ...typography.body,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.bodySmall,
    color: Colors.gray500,
  },
  detailsContainer: {
    padding: spacing.lg,
    backgroundColor: Colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: scaleSize(12),
    marginBottom: spacing.xl,
    ...deviceAdjustments.elevation,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  detailLabel: {
    ...typography.body,
    color: Colors.gray600,
    flex: 1,
  },
  detailValue: {
    ...typography.body,
    color: Colors.gray900,
    flex: 1,
    textAlign: "right",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: Colors.gray900,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
  // Not Found Styles
  notFoundContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: scaleSize(20),
  },
  notFoundCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(32),
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginVertical: scaleSize(20),
  },
  iconContainer: {
    marginBottom: scaleSize(24),
  },
  iconBackground: {
    width: scaleSize(120),
    height: scaleSize(120),
    borderRadius: scaleSize(60),
    backgroundColor: Colors.primary50,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundTitle: {
    fontSize: scaleSize(24),
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: scaleSize(8),
    textAlign: "center",
  },
  notFoundSubtitle: {
    fontSize: scaleSize(16),
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: scaleSize(16),
  },
  returnNumberBox: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(8),
    marginBottom: scaleSize(24),
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  returnNumberText: {
    fontSize: scaleSize(18),
    fontWeight: "600",
    color: Colors.gray900,
    fontFamily: "monospace",
  },
  notFoundDescription: {
    fontSize: scaleSize(16),
    color: Colors.gray700,
    textAlign: "center",
    marginBottom: scaleSize(16),
    fontWeight: "500",
  },
  reasonsList: {
    width: "100%",
    marginBottom: scaleSize(32),
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(4),
  },
  reasonText: {
    fontSize: scaleSize(14),
    color: Colors.gray600,
    marginLeft: scaleSize(12),
    flex: 1,
  },
  actionButtons: {
    width: "100%",
    gap: scaleSize(12),
  },
  refreshButton: {
    backgroundColor: Colors.primary500,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
  },
  viewAllButton: {
    backgroundColor: Colors.blue600,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
  },
  goBackButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary500,
    borderWidth: 2,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scaleSize(8),
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: scaleSize(16),
    fontWeight: "600",
  },
  viewAllButtonText: {
    color: Colors.white,
    fontSize: scaleSize(16),
    fontWeight: "600",
  },
  goBackButtonText: {
    color: Colors.primary600,
    fontSize: scaleSize(16),
    fontWeight: "600",
  },
  cancelButtonContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.error500,
    borderWidth: 2,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
  },
  cancelButtonText: {
    color: Colors.error500,
    fontSize: scaleSize(16),
    fontWeight: "600",
  },
  helpSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scaleSize(24),
    padding: scaleSize(16),
    backgroundColor: Colors.blue50,
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: Colors.blue200,
  },
  helpText: {
    fontSize: scaleSize(14),
    color: Colors.blue700,
    marginLeft: scaleSize(12),
    flex: 1,
    lineHeight: scaleSize(20),
  },
});

export default ReturnTrackingScreen;

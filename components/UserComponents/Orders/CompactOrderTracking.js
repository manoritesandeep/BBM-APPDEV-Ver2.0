import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
// import { useI18n } from "../../../hooks/useI18n";

import { useI18n } from "../../../store/i18n-context";

const TRACKING_STAGES = [
  { key: "placed", label: "Placed", shortLabel: "Placed" },
  { key: "confirmed", label: "Confirmed", shortLabel: "Confirmed" },
  { key: "preparing", label: "Preparing", shortLabel: "Preparing" },
  { key: "processing", label: "Processing", shortLabel: "Processing" }, // Alias for preparing
  { key: "shipped", label: "Shipped", shortLabel: "Shipped" },
  { key: "delivered", label: "Delivered", shortLabel: "Delivered" },
];

function CompactOrderTracking({ order }) {
  const { t } = useI18n();
  const currentStatus = order.status?.toLowerCase();

  // Create translated tracking stages
  const getTranslatedStages = () => [
    {
      key: "placed",
      label: t("orders.placed"),
      shortLabel: t("orders.placed"),
    },
    {
      key: "confirmed",
      label: t("orders.confirmed"),
      shortLabel: t("orders.confirmed"),
    },
    {
      key: "preparing",
      label: t("orders.preparing"),
      shortLabel: t("orders.preparing"),
    },
    {
      key: "processing",
      label: t("orders.processing"),
      shortLabel: t("orders.processing"),
    },
    {
      key: "shipped",
      label: t("orders.shipped"),
      shortLabel: t("orders.shipped"),
    },
    {
      key: "delivered",
      label: t("orders.delivered"),
      shortLabel: t("orders.delivered"),
    },
  ];

  // Handle cancelled orders
  if (currentStatus === "cancelled") {
    return (
      <View style={styles.container}>
        <View style={styles.cancelledContainer}>
          <Ionicons name="close-circle" size={16} color={Colors.accent500} />
          <Text style={styles.cancelledText}>{t("orders.orderCancelled")}</Text>
        </View>
      </View>
    );
  }

  const translatedStages = getTranslatedStages();

  // Find current stage
  // Normalize processing to preparing for stage calculation
  const normalizedStatus =
    currentStatus === "processing" ? "preparing" : currentStatus;
  const mainStages = translatedStages.filter(
    (stage) => stage.key !== "processing"
  );
  const currentStageIndex = mainStages.findIndex(
    (stage) => stage.key === normalizedStatus
  );
  const activeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStage =
    translatedStages.find((stage) => stage.key === currentStatus) ||
    mainStages[activeStageIndex];

  // Calculate progress percentage (excluding processing from count)
  const progressPercentage = ((activeStageIndex + 1) / mainStages.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {activeStageIndex + 1} of {mainStages.length}
        </Text>
      </View>

      {/* Current Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIconContainer}>
          <Ionicons
            name={getStageIcon(currentStatus)}
            size={14}
            color={Colors.primary500}
          />
        </View>
        <Text style={styles.statusText}>{currentStage.label}</Text>

        {/* Expected delivery */}
        {order.expectedDeliveryDate && currentStatus !== "delivered" && (
          <Text style={styles.deliveryText}>
            · {t("orders.expected")}{" "}
            {new Date(
              order.expectedDeliveryDate.seconds * 1000
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

function getStageIcon(status) {
  const iconMap = {
    placed: "checkmark-circle",
    confirmed: "thumbs-up",
    preparing: "construct",
    processing: "construct", // Same as preparing
    shipped: "airplane",
    delivered: "home",
  };
  return iconMap[status] || "checkmark-circle";
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.success600,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Colors.gray600,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray700,
  },
  deliveryText: {
    fontSize: 11,
    color: Colors.gray600,
    marginLeft: 4,
  },
  // Cancelled styles
  cancelledContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cancelledText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.accent500,
    marginLeft: 4,
  },
});

export default CompactOrderTracking;

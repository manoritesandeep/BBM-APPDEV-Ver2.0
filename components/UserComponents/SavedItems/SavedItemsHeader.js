import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { typography, spacing, layout } from "../../../constants/responsive";
import { useI18n } from "../../../store/i18n-context";

const SavedItemsHeader = memo(function SavedItemsHeader({
  onBackPress,
  itemCount,
  onClearAll,
  showClearAll = false,
}) {
  const { t } = useI18n();

  // Memoize the subtitle text to prevent unnecessary recalculations
  const subtitleText = useMemo(
    () =>
      t("user.savedItemsCount", {
        count: itemCount,
        itemText: itemCount === 1 ? t("user.item") : t("user.items"),
      }),
    [itemCount, t]
  );
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{t("user.savedItems")}</Text>
        <Text style={styles.headerSubtitle}>{subtitleText}</Text>
      </View>

      {showClearAll && (
        <TouchableOpacity style={styles.headerAction} onPress={onClearAll}>
          <Text style={styles.headerActionText}>{t("user.clearAll")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SavedItemsHeader;

const styles = StyleSheet.create({
  header: {
    ...layout.flexRow,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: "600",
    color: Colors.gray900,
  },
  headerSubtitle: {
    ...typography.caption,
    color: Colors.gray600,
    marginTop: 2,
  },
  headerAction: {
    padding: spacing.xs,
  },
  headerActionText: {
    ...typography.body,
    color: Colors.error500,
    fontWeight: "500",
  },
});

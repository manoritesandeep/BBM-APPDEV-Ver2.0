import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { typography, spacing } from "../../../constants/responsive";
import { useI18n } from "../../../store/i18n-context";

const SavedItemsEmptyState = memo(function SavedItemsEmptyState({
  onStartShopping,
}) {
  const { t } = useI18n();

  return (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={Colors.gray400} />
      <Text style={styles.emptyTitle}>{t("user.noSavedItemsYet")}</Text>
      <Text style={styles.emptySubtitle}>{t("user.savedItemsWillAppear")}</Text>
      <TouchableOpacity style={styles.shopButton} onPress={onStartShopping}>
        <Text style={styles.shopButtonText}>{t("user.startShopping")}</Text>
      </TouchableOpacity>
    </View>
  );
});

export default SavedItemsEmptyState;

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    fontWeight: "600",
    color: Colors.gray900,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  shopButton: {
    backgroundColor: Colors.accent500,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  shopButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: "600",
  },
});

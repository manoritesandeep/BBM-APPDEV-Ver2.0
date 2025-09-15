import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { typography, spacing, layout } from "../../../constants/responsive";

const SavedItemsActionsBar = memo(function SavedItemsActionsBar({
  onAddAllToCart,
}) {
  return (
    <View style={styles.actionsBar}>
      <TouchableOpacity style={styles.addAllButton} onPress={onAddAllToCart}>
        <Ionicons name="cart" size={16} color={Colors.white} />
        <Text style={styles.addAllButtonText}>Add All to Cart</Text>
      </TouchableOpacity>
    </View>
  );
});

export default SavedItemsActionsBar;

const styles = StyleSheet.create({
  actionsBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  addAllButton: {
    ...layout.flexRow,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent500,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  addAllButtonText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
});

import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

const RETURN_REASON_OPTIONS = [
  {
    id: "defective",
    label: "Defective Item",
    description: "Item arrived damaged or not working",
    icon: "warning-outline",
  },
  {
    id: "wrong_item",
    label: "Wrong Item",
    description: "Received different item than ordered",
    icon: "swap-horizontal-outline",
  },
  {
    id: "damaged_shipping",
    label: "Damaged in Shipping",
    description: "Item was damaged during delivery",
    icon: "cube-outline",
  },
  {
    id: "size_issue",
    label: "Size Issue",
    description: "Item doesn't fit or wrong size",
    icon: "resize-outline",
  },
  {
    id: "color_mismatch",
    label: "Color Mismatch",
    description: "Color different from what was expected",
    icon: "color-palette-outline",
  },
  {
    id: "quality_issue",
    label: "Quality Issue",
    description: "Item quality below expectations",
    icon: "star-outline",
  },
  {
    id: "not_as_described",
    label: "Not as Described",
    description: "Item doesn't match product description",
    icon: "document-text-outline",
  },
  {
    id: "changed_mind",
    label: "Changed Mind",
    description: "No longer need this item",
    icon: "refresh-outline",
  },
  {
    id: "other",
    label: "Other",
    description: "Please specify your reason",
    icon: "ellipsis-horizontal-outline",
  },
];

function ReasonSelectionStep({
  returnReason,
  customReason,
  onReasonChange,
  onCustomReasonChange,
  reasonError,
  customReasonError,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Why are you returning these items?</Text>
      <Text style={styles.stepDescription}>
        Please select the primary reason for your return. This helps us improve
        our service.
      </Text>

      {reasonError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error500} />
          <Text style={styles.errorText}>{reasonError}</Text>
        </View>
      )}

      <View style={styles.reasonsList}>
        {RETURN_REASON_OPTIONS.map((option) => {
          const isSelected = returnReason === option.id;

          return (
            <Pressable
              key={option.id}
              style={[styles.reasonOption, isSelected && styles.selectedReason]}
              onPress={() => onReasonChange(option.id)}
            >
              <View style={styles.reasonContent}>
                <View style={styles.reasonIcon}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={isSelected ? Colors.primary500 : Colors.gray600}
                  />
                </View>

                <View style={styles.reasonText}>
                  <Text
                    style={[
                      styles.reasonLabel,
                      isSelected && styles.selectedReasonLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.reasonDescription}>
                    {option.description}
                  </Text>
                </View>

                <View style={styles.radioContainer}>
                  <View
                    style={[styles.radio, isSelected && styles.selectedRadio]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Custom reason input */}
      {returnReason === "other" && (
        <View style={styles.customReasonContainer}>
          <Text style={styles.customReasonLabel}>
            Please specify your reason:
          </Text>
          <TextInput
            style={[
              styles.customReasonInput,
              customReasonError && styles.inputError,
            ]}
            value={customReason}
            onChangeText={onCustomReasonChange}
            placeholder="Tell us more about why you're returning this item..."
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {customReasonError && (
            <Text style={styles.inputErrorText}>{customReasonError}</Text>
          )}
        </View>
      )}

      {/* Information box */}
      <View style={styles.infoContainer}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={Colors.blue500}
        />
        <Text style={styles.infoText}>
          Your return reason helps us process your request faster and improve
          our products and services.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    ...typography.heading3,
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    ...typography.body,
    color: Colors.gray600,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body2,
    color: Colors.error700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  reasonsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonOption: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedReason: {
    borderColor: Colors.primary500,
    borderWidth: 2,
    backgroundColor: Colors.primary25,
  },
  reasonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  reasonIcon: {
    marginRight: spacing.md,
  },
  reasonText: {
    flex: 1,
  },
  reasonLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  selectedReasonLabel: {
    color: Colors.primary700,
  },
  reasonDescription: {
    ...typography.body2,
    color: Colors.gray600,
  },
  radioContainer: {
    marginLeft: spacing.md,
  },
  radio: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(10),
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadio: {
    borderColor: Colors.primary500,
  },
  radioInner: {
    width: scaleSize(10),
    height: scaleSize(10),
    borderRadius: scaleSize(5),
    backgroundColor: Colors.primary500,
  },
  customReasonContainer: {
    marginBottom: spacing.lg,
  },
  customReasonLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  customReasonInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    ...typography.body,
    color: Colors.gray900,
    minHeight: scaleSize(80),
  },
  inputError: {
    borderColor: Colors.error500,
  },
  inputErrorText: {
    ...typography.caption,
    color: Colors.error600,
    marginTop: spacing.xs,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.blue50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.blue200,
  },
  infoText: {
    ...typography.body2,
    color: Colors.blue700,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default ReasonSelectionStep;

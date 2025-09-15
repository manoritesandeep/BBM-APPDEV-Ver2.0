import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";
import QuantitySelector from "../../CartComponents/QuantitySelector";

function ItemSelectionStep({
  order,
  eligibleItems,
  selectedItems,
  onToggleItem,
  onUpdateQuantity,
  error,
}) {
  const isItemSelected = (itemId) => {
    return selectedItems.some((selected) => selected.itemId === itemId);
  };

  const getSelectedQuantity = (itemId) => {
    const selected = selectedItems.find((item) => item.itemId === itemId);
    return selected ? selected.quantity : 0;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Select Items to Return</Text>
      <Text style={styles.stepDescription}>
        Choose the items you want to return from order {order.orderNumber}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error500} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.itemsList}>
        {eligibleItems.map((item) => {
          const isSelected = isItemSelected(item.id);
          const selectedQuantity = getSelectedQuantity(item.id);

          return (
            <View key={item.id} style={styles.itemCard}>
              <Pressable
                style={[styles.itemContent, isSelected && styles.selectedItem]}
                onPress={() => onToggleItem(item, 1)}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.imageContainer}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color={Colors.gray400}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.productName}
                    </Text>

                    <View style={styles.itemSpecs}>
                      {item.sizes && (
                        <Text style={styles.specText}>Size: {item.sizes}</Text>
                      )}
                      {item.colour && (
                        <Text style={styles.specText}>
                          Color: {item.colour}
                        </Text>
                      )}
                    </View>

                    <View style={styles.priceAndQuantity}>
                      <Text style={styles.itemPrice}>₹{item.price}</Text>
                      <Text style={styles.originalQuantity}>
                        Ordered: {item.quantity} • Available:{" "}
                        {item.maxReturnableQuantity}
                      </Text>
                    </View>

                    <View style={styles.returnInfo}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={Colors.orange500}
                      />
                      <Text style={styles.returnWindow}>
                        {item.remainingDays} days left to return
                      </Text>
                    </View>
                  </View>

                  <View style={styles.selectionContainer}>
                    <Pressable
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkedCheckbox,
                      ]}
                      onPress={() => onToggleItem(item, isSelected ? 0 : 1)}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={Colors.white}
                        />
                      )}
                    </Pressable>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Return Quantity:</Text>
                    <QuantitySelector
                      quantity={selectedQuantity}
                      onChange={(newQuantity) => {
                        // Ensure quantity is within bounds
                        const clampedQuantity = Math.max(
                          1,
                          Math.min(newQuantity, item.maxReturnableQuantity)
                        );
                        onUpdateQuantity(item.id, clampedQuantity);
                      }}
                      min={1}
                      max={item.maxReturnableQuantity}
                      style={styles.quantitySelector}
                    />
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {eligibleItems.length === 0 && (
        <View style={styles.noItemsContainer}>
          <Ionicons name="cube-outline" size={48} color={Colors.gray400} />
          <Text style={styles.noItemsTitle}>No Returnable Items</Text>
          <Text style={styles.noItemsMessage}>
            No items in this order are eligible for return at this time.
          </Text>
        </View>
      )}

      {selectedItems.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}{" "}
            selected •{" "}
            {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} unit
            {selectedItems.reduce((sum, item) => sum + item.quantity, 0) > 1
              ? "s"
              : ""}{" "}
            total
          </Text>
        </View>
      )}
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
  itemsList: {
    gap: spacing.md,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    overflow: "hidden",
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    padding: spacing.md,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: Colors.primary500,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  itemImage: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(8),
  },
  imagePlaceholder: {
    width: scaleSize(60),
    height: scaleSize(60),
    backgroundColor: Colors.gray100,
    borderRadius: scaleSize(8),
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  itemSpecs: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  specText: {
    ...typography.caption,
    color: Colors.gray600,
  },
  priceAndQuantity: {
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
  },
  originalQuantity: {
    ...typography.caption,
    color: Colors.gray600,
  },
  returnInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnWindow: {
    ...typography.caption,
    color: Colors.orange700,
    marginLeft: spacing.xs,
  },
  selectionContainer: {
    marginLeft: spacing.md,
  },
  checkbox: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: scaleSize(4),
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCheckbox: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  quantityLabel: {
    ...typography.body2,
    color: Colors.gray700,
    fontWeight: "500",
  },
  quantitySelector: {
    transform: [{ scale: 0.9 }],
  },
  noItemsContainer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  noItemsTitle: {
    ...typography.heading4,
    color: Colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  noItemsMessage: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
  },
  selectionSummary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: Colors.primary50,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  summaryText: {
    ...typography.body2,
    color: Colors.primary700,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ItemSelectionStep;

import React, { memo, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Colors } from "../../../constants/styles";
import { spacing } from "../../../constants/responsive";
import SavedItemCard from "./SavedItemCard";

const SavedItemsList = memo(function SavedItemsList({
  savedItems,
  refreshing,
  onRefresh,
  onAddToCart,
  onRemoveFromSaved,
  getPriceComparison,
  getProductById,
}) {
  // Memoize the render function to prevent unnecessary re-creations
  const renderSavedItem = useCallback(
    ({ item }) => {
      const priceInfo = getPriceComparison(item);
      const currentProduct = getProductById(item.productId);

      return (
        <SavedItemCard
          item={item}
          currentProduct={currentProduct}
          priceInfo={priceInfo}
          onAddToCart={onAddToCart}
          onRemove={onRemoveFromSaved}
        />
      );
    },
    [getPriceComparison, getProductById, onAddToCart, onRemoveFromSaved]
  );

  // Memoize the key extractor function
  const keyExtractor = useCallback((item) => item.id, []);

  // Memoize the separator component
  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  // Memoize the refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[Colors.primary500, Colors.accent500]}
        tintColor={Colors.primary500}
      />
    ),
    [refreshing, onRefresh]
  );

  return (
    <FlatList
      data={savedItems}
      renderItem={renderSavedItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparatorComponent}
      refreshControl={refreshControl}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 120, // Approximate item height + separator
        offset: 120 * index,
        index,
      })}
    />
  );
});

export default SavedItemsList;

const styles = StyleSheet.create({
  listContainer: {
    padding: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
});

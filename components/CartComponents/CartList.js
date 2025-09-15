import { FlatList, StyleSheet, RefreshControl } from "react-native";
import CartItem from "./CartItem";
import CompactCartItem from "./CompactCartItem";
import { Colors } from "../../constants/styles";
import { spacing } from "../../constants/responsive";

function CartList({
  items,
  onRemove,
  onQuantityChange,
  ListFooterComponent,
  onRefresh,
  refreshing = false,
  compact = true, // Default to compact layout
}) {
  const ItemComponent = compact ? CompactCartItem : CartItem;
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <ItemComponent
          item={item}
          onRemove={onRemove}
          onQuantityChange={onQuantityChange}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={15}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary500, Colors.accent500]}
            tintColor={Colors.primary500}
            title="Pull to refresh cart"
            titleColor={Colors.primary500}
          />
        ) : undefined
      }
    />
  );
}

export default CartList;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
});

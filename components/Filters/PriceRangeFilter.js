// Price Range Filter Component - Specialized for price filtering
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  layout,
} from "../../constants/responsive";
import FilterOption from "./FilterOption";

function PriceRangeFilter({
  ranges,
  counts,
  activeValues,
  onFilterUpdate,
  filterType,
}) {
  if (!ranges || ranges.length === 0) return null;

  return (
    <View style={styles.container}>
      {ranges.map((range, index) => {
        const count = counts[range.label] || 0;
        const isActive = activeValues.includes(range.label);

        // Skip ranges with no products
        if (count === 0) return null;

        return (
          <FilterOption
            key={`${range.label}-${index}`}
            label={range.label}
            count={count}
            isActive={isActive}
            onPress={() => onFilterUpdate(filterType, range.label)}
            isMultiSelect={true}
            customIcon="cash-outline"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
});

export default React.memo(PriceRangeFilter);

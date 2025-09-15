import { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
} from "../../constants/responsive";

export default function CompactSizeSelector({
  variants,
  initialIndex = 0,
  onSelect,
  style,
}) {
  const [selected, setSelected] = useState(initialIndex);

  const allSizesEmpty = variants.every(
    (p) => !p.sizes || p.sizes.trim() === ""
  );

  function handleSelect(idx) {
    setSelected(idx);
    onSelect && onSelect(idx, variants[idx]);
  }

  if (allSizesEmpty) {
    return null; // Don't show anything for compact view if no sizes
  }

  return (
    <View style={[styles.sizesContainer, style]}>
      {variants.map((p, idx) =>
        p.sizes && p.sizes.trim() !== "" ? (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.sizeButton,
              idx === selected && styles.sizeButtonSelected,
            ]}
            onPress={() => handleSelect(idx)}
          >
            <Text
              style={[
                styles.sizeButtonText,
                idx === selected && styles.sizeButtonTextSelected,
              ]}
              allowFontScaling={true}
            >
              {p.sizes}
            </Text>
          </TouchableOpacity>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sizesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    // marginVertical: spacing.xs,
    // marginHorizontal: spacing.xs,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: scaleSize(6),
    paddingHorizontal: scaleSize(6),
    paddingVertical: scaleVertical(4),
    marginHorizontal: spacing.xs / 2.5,
    marginVertical: 1,
    backgroundColor: "#fff",
    minWidth: scaleSize(24),
    minHeight: deviceAdjustments.minTouchTarget * 0.5, // Smaller touch targets for compact selector
  },
  sizeButtonSelected: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
  },
  sizeButtonText: {
    fontSize: Math.max(typography.caption.fontSize * 0.8, 8), // Ensure minimum readability
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  sizeButtonTextSelected: {
    fontWeight: "bold",
    color: Colors.accent500,
  },
});

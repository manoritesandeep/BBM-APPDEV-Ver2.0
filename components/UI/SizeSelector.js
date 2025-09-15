import { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/styles";

import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  layout,
  getComponentSizes,
} from "../../constants/responsive";

export default function SizeSelector({
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
    return <Text style={styles.noSizeText}>No additional sizes</Text>;
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
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sizeButton: {
    borderWidth: 1.25,
    borderColor: Colors.borderDark,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 3,
    marginVertical: 1,
    backgroundColor: "#fff",
  },
  sizeButtonSelected: {
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
  },
  sizeButtonText: {
    fontSize: scaleSize(10),
    fontWeight: "700",
    color: "black",
  },
  sizeButtonTextSelected: {
    fontWeight: "bold",
    color: Colors.accent500,
  },
  noSizeText: {
    fontSize: 12,
    color: Colors.accent500,
    fontStyle: "italic",
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});

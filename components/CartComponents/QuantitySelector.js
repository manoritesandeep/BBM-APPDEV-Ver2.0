import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  scaleVertical,
  deviceAdjustments,
  iconSizes,
  layout,
} from "../../constants/responsive";

function QuantitySelector({ quantity, onChange }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, quantity <= 1 && styles.buttonDisabled]}
        onPress={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        activeOpacity={0.7}
      >
        <Ionicons
          name="remove"
          size={iconSizes.sm}
          color={quantity <= 1 ? Colors.gray400 : Colors.white}
        />
      </TouchableOpacity>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity} allowFontScaling={true}>
          {quantity}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onChange(quantity + 1)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={iconSizes.sm} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export default QuantitySelector;

const styles = StyleSheet.create({
  container: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.primary50,
    borderRadius: scaleSize(20),
    paddingHorizontal: spacing.xs / 2,
    paddingVertical: spacing.xs / 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: scaleSize(100),
  },
  button: {
    width: scaleSize(26),
    height: scaleSize(26),
    borderRadius: scaleSize(13),
    backgroundColor: Colors.accent500,
    alignItems: "center",
    justifyContent: "center",
    ...deviceAdjustments.shadow,
    shadowColor: Colors.accent500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityContainer: {
    minWidth: scaleSize(32),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  quantity: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.gray900,
    textAlign: "center",
  },
});

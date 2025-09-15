import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/styles";
import {
  getComponentSizes,
  typography,
  deviceAdjustments,
  scaleSize,
  scaleVertical,
} from "../../constants/responsive";

function Button({
  children,
  onPress,
  mode,
  style,
  textStyle,
  size = "medium",
}) {
  const componentSizes = getComponentSizes();
  const buttonSize =
    componentSizes.button[size] || componentSizes.button.medium;

  return (
    <View style={style}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View
          style={[
            styles.button,
            buttonSize,
            mode === "flat" && styles.flat,
            mode === "filled" && styles.filled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              typography.button,
              size === "small" && typography.buttonSmall,
              mode === "flat" && styles.flatText,
              mode === "filled" && styles.filledText,
              textStyle, // Apply custom textStyle last to override defaults
            ]}
          >
            {children}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: deviceAdjustments.borderRadius,
    backgroundColor: Colors.primary100,
    ...deviceAdjustments.shadow,
    minHeight: deviceAdjustments.minTouchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  flat: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: Colors.gray900,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  filled: {
    backgroundColor: Colors.primary500,
    elevation: 3,
    shadowOpacity: 0.15,
  },
  flatText: {
    color: Colors.gray700,
  },
  filledText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

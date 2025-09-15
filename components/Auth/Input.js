import { View, Text, TextInput, StyleSheet } from "react-native";

import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  getComponentSizes,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";

function Input({
  label,
  keyboardType,
  secure,
  onUpdateValue,
  value,
  isInvalid,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text
        style={[styles.label, isInvalid && styles.labelInvalid]}
        allowFontScaling={true}
      >
        {label}
      </Text>
      <TextInput
        style={[styles.input, isInvalid && styles.inputInvalid]}
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secure}
        onChangeText={onUpdateValue}
        value={value}
        allowFontScaling={true}
      />
    </View>
  );
}

export default Input;

const componentSizes = getComponentSizes();

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: "black",
    marginBottom: spacing.xs * 0.5,
  },
  labelInvalid: {
    color: Colors.error500,
  },
  input: {
    height: componentSizes.input.height * 0.6,
    paddingHorizontal: componentSizes.input.paddingHorizontal,
    backgroundColor: Colors.primary50,
    borderRadius: deviceAdjustments.borderRadius,
    ...typography.body,
  },
  inputInvalid: {
    backgroundColor: Colors.error100,
  },
});

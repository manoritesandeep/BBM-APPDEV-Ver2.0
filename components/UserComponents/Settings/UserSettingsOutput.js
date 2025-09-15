import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../store/theme-context";

import Language from "./Language/Language";
import Mode from "./Mode/Mode";

function UserSettingsOutput() {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Language />
      <Mode />
      {/* Add more settings as needed */}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 16,
    },
  });

export default UserSettingsOutput;

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../store/theme-context";
import { useI18n } from "../../../../store/i18n-context";

function Mode() {
  const { theme, changeTheme, colors, isDark } = useTheme();
  const { t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);

  const themeOptions = [
    {
      value: "light",
      label: t("settings.lightMode"),
      icon: "sunny",
      description: "Always use light theme",
    },
    {
      value: "dark",
      label: t("settings.darkMode"),
      icon: "moon",
      description: "Always use dark theme",
    },
    {
      value: "system",
      label: t("settings.systemDefault"),
      icon: "phone-portrait",
      description: "Follow system setting",
    },
  ];

  const handleThemeSelect = async (themeValue) => {
    await changeTheme(themeValue);
    setModalVisible(false);
  };

  const getCurrentThemeLabel = () => {
    const currentTheme = themeOptions.find((option) => option.value === theme);
    return currentTheme ? currentTheme.label : t("settings.systemDefault");
  };

  const getCurrentThemeIcon = () => {
    const currentTheme = themeOptions.find((option) => option.value === theme);
    return currentTheme ? currentTheme.icon : "phone-portrait";
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Ionicons
            name={getCurrentThemeIcon()}
            size={24}
            color={colors.text}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t("settings.appearance")}</Text>
            <Text style={styles.subtitle}>{getCurrentThemeLabel()}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.theme")}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.themeList}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    theme === option.value && styles.selectedTheme,
                  ]}
                  onPress={() => handleThemeSelect(option.value)}
                >
                  <View style={styles.themeIconContainer}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={
                        theme === option.value ? colors.accent500 : colors.text
                      }
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text
                      style={[
                        styles.themeName,
                        theme === option.value && styles.selectedThemeText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.themeDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {theme === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.accent500}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isDark ? "🌙 Dark mode is active" : "☀️ Light mode is active"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    themeButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "60%",
      minHeight: 300,
      paddingBottom: 30,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    themeList: {
      paddingVertical: 8,
      maxHeight: 300,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    selectedTheme: {
      backgroundColor: colors.primary50,
      borderWidth: 1,
      borderColor: colors.accent500,
    },
    themeIconContainer: {
      marginRight: 16,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 2,
    },
    selectedThemeText: {
      color: colors.accent500,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
  });

export default Mode;

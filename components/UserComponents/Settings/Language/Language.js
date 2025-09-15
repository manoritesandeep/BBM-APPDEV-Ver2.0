import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../../../../store/i18n-context";
import { useTheme } from "../../../../store/theme-context";

const { width } = Dimensions.get("window");

function Language() {
  const { currentLanguage, changeLanguage, supportedLanguages, t } = useI18n();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setModalVisible(false);
  };

  const getCurrentLanguageName = () => {
    const currentLang = supportedLanguages.find(
      (lang) => lang.code === currentLanguage
    );
    return currentLang ? currentLang.nativeName : "English";
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="language" size={24} color={colors.text} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t("settings.language")}</Text>
            <Text style={styles.subtitle}>{getCurrentLanguageName()}</Text>
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
              <Text style={styles.modalTitle}>
                {t("settings.changeLanguage")}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {supportedLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code &&
                      styles.selectedLanguage,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>
                      {language.nativeName}
                    </Text>
                    <Text style={styles.languageEnglishName}>
                      {language.name}
                    </Text>
                  </View>
                  {currentLanguage === language.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.accent500}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    languageButton: {
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
      maxHeight: "70%",
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
    languageList: {
      maxHeight: 400,
    },
    languageOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedLanguage: {
      backgroundColor: colors.primary50,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 2,
    },
    languageEnglishName: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

export default Language;

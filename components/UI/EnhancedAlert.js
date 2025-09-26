import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

/**
 * Enhanced Alert Component for Phone Authentication Errors
 * Provides user-friendly error messages with actionable buttons
 */
const EnhancedAlert = ({
  visible,
  title,
  message,
  type = "error",
  buttons = [],
  onDismiss,
  dismissible = true,
  customIcon,
}) => {
  const { t } = useTranslation();

  const getAlertStyle = () => {
    switch (type) {
      case "error":
        return {
          backgroundColor: "#FFE6E6",
          borderColor: Colors.error500,
          iconName: "alert-circle",
          iconColor: Colors.error500,
          titleColor: Colors.error700,
        };
      case "warning":
        return {
          backgroundColor: "#FFF4E6",
          borderColor: "#FF9500",
          iconName: "warning",
          iconColor: "#FF9500",
          titleColor: "#B8860B",
        };
      case "info":
        return {
          backgroundColor: "#E6F3FF",
          borderColor: Colors.primary500,
          iconName: "information-circle",
          iconColor: Colors.primary500,
          titleColor: Colors.primary700,
        };
      case "success":
        return {
          backgroundColor: "#E6FFE6",
          borderColor: "#4CAF50",
          iconName: "checkmark-circle",
          iconColor: "#4CAF50",
          titleColor: "#2E7D32",
        };
      default:
        return {
          backgroundColor: "#F5F5F5",
          borderColor: Colors.accent500,
          iconName: "help-circle",
          iconColor: Colors.accent500,
          titleColor: Colors.accent700,
        };
    }
  };

  const handleBackdropPress = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  const defaultButtons = [
    {
      text: t("common.ok", "OK"),
      style: "default",
      onPress: onDismiss,
    },
  ];

  const alertButtons = buttons.length > 0 ? buttons : defaultButtons;
  const style = getAlertStyle();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        <View
          style={[styles.alertContainer, { borderColor: style.borderColor }]}
        >
          {/* Header with Icon */}
          <View
            style={[styles.header, { backgroundColor: style.backgroundColor }]}
          >
            <Ionicons
              name={customIcon || style.iconName}
              size={32}
              color={style.iconColor}
            />
            <Text style={[styles.title, { color: style.titleColor }]}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {alertButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "destructive" && styles.destructiveButton,
                  button.style === "cancel" && styles.cancelButton,
                  alertButtons.length === 1 && styles.singleButton,
                  index === 0 && alertButtons.length > 1 && styles.leftButton,
                  index === alertButtons.length - 1 &&
                    alertButtons.length > 1 &&
                    styles.rightButton,
                ]}
                onPress={() => {
                  button.onPress && button.onPress();
                  if (button.dismissOnPress !== false) {
                    onDismiss && onDismiss();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "destructive" &&
                      styles.destructiveButtonText,
                    button.style === "cancel" && styles.cancelButtonText,
                    button.style === "default" && styles.defaultButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    maxWidth: width - 40,
    minWidth: width * 0.8,
    elevation: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    flex: 1,
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.accent700,
    textAlign: "left",
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.accent200,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  singleButton: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  leftButton: {
    borderRightWidth: 0.5,
    borderRightColor: Colors.accent200,
    borderBottomLeftRadius: 14,
  },
  rightButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: Colors.accent200,
    borderBottomRightRadius: 14,
  },
  cancelButton: {
    backgroundColor: Colors.accent100,
  },
  destructiveButton: {
    backgroundColor: "#FFE6E6",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultButtonText: {
    color: Colors.primary500,
  },
  cancelButtonText: {
    color: Colors.accent600,
  },
  destructiveButtonText: {
    color: Colors.error500,
  },
});

export default EnhancedAlert;

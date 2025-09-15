import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../store/auth-context";
import { Colors } from "../../constants/styles";
import { scaleSize, spacing, typography } from "../../constants/responsive";
import FeedbackModal from "./FeedbackModal";
import { checkExistingFeedback } from "../../util/feedbackService";

function FeedbackTrigger({
  type = "order", // order, product, app, service
  orderId = null,
  productId = null,
  orderData = null,
  style = {},
  showLabel = true,
  compact = false,
  customColor,
  onFeedbackSubmitted,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);
  const { userId } = useContext(AuthContext);

  // Check if feedback already exists on component mount
  useEffect(() => {
    const checkFeedback = async () => {
      if (!userId || (!orderId && !productId)) return;

      setCheckingFeedback(true);
      try {
        const result = await checkExistingFeedback(userId, orderId, productId);
        setFeedbackExists(result.exists);
      } catch (error) {
        console.error("Error checking feedback:", error);
        setFeedbackExists(false);
      } finally {
        setCheckingFeedback(false);
      }
    };

    checkFeedback();
  }, [userId, orderId, productId]);

  const getTypeConfig = () => {
    switch (type) {
      case "order":
        return {
          icon: "star-outline",
          label: "Rate Order",
          description: "Share your experience",
          color: Colors.primary500,
        };
      case "product":
        return {
          icon: "thumbs-up-outline",
          label: "Rate Product",
          description: "Rate this product",
          color: Colors.success,
        };
      case "app":
        return {
          icon: "chatbubble-outline",
          label: "App Feedback",
          description: "Help us improve",
          color: Colors.accent500,
        };
      case "service":
        return {
          icon: "help-circle-outline",
          label: "Service Feedback",
          description: "Rate our service",
          color: Colors.primary500,
        };
      default:
        return {
          icon: "star-outline",
          label: "Give Feedback",
          description: "Share your thoughts",
          color: Colors.primary500,
        };
    }
  };

  const config = getTypeConfig();

  // Show different states based on feedback status
  const getButtonConfig = () => {
    if (checkingFeedback) {
      return {
        ...config,
        icon: "time",
        label: "Checking...",
        description: "Please wait",
        disabled: true,
      };
    }

    if (feedbackExists) {
      return {
        ...config,
        icon: "checkmark-circle",
        label: "Feedback Submitted",
        description: "Thank you!",
        color: Colors.success,
        disabled: true,
      };
    }

    return config;
  };

  const buttonConfig = getButtonConfig();

  const handleModalClose = useCallback(
    (feedbackSubmitted = false) => {
      setModalVisible(false);
      if (feedbackSubmitted) {
        setFeedbackExists(true);
        // Optional: Call parent callback to refresh data
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      }
    },
    [onFeedbackSubmitted]
  );

  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.compactButton,
            { borderColor: buttonConfig.color },
            buttonConfig.disabled && styles.disabledButton,
            style,
          ]}
          onPress={() => !buttonConfig.disabled && setModalVisible(true)}
          disabled={buttonConfig.disabled}
        >
          <Ionicons
            name={buttonConfig.icon}
            size={16}
            color={buttonConfig.color}
          />
          {showLabel && (
            <Text style={[styles.compactText, { color: buttonConfig.color }]}>
              {buttonConfig.label}
            </Text>
          )}
        </TouchableOpacity>

        <FeedbackModal
          visible={modalVisible}
          onClose={handleModalClose}
          feedbackType={type}
          orderId={orderId}
          productId={productId}
          orderData={orderData}
        />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: buttonConfig.color },
          buttonConfig.disabled && styles.disabledButton,
          style,
        ]}
        onPress={() => !buttonConfig.disabled && setModalVisible(true)}
        disabled={buttonConfig.disabled}
      >
        <Ionicons name={buttonConfig.icon} size={20} color="white" />
        {showLabel && (
          <View style={styles.textContainer}>
            <Text style={styles.buttonText}>{buttonConfig.label}</Text>
            <Text style={styles.descriptionText}>
              {buttonConfig.description}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <FeedbackModal
        visible={modalVisible}
        onClose={handleModalClose}
        feedbackType={type}
        orderId={orderId}
        productId={productId}
        orderData={orderData}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: scaleSize(8),
    gap: spacing.sm,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: scaleSize(16),
    borderWidth: 1,
    backgroundColor: "white",
    gap: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    ...typography.body,
    color: "white",
    fontWeight: "600",
  },
  descriptionText: {
    ...typography.caption,
    color: "white",
    opacity: 0.9,
  },
  compactText: {
    ...typography.caption,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default FeedbackTrigger;

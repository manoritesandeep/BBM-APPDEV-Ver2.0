import React, { useContext, useState } from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SavedItemsContext } from "../../store/saved-items-context";
import { AuthContext } from "../../store/auth-context";
import { useToast } from "../UI/ToastProvider";
import { Colors } from "../../constants/styles";
import { iconSizes } from "../../constants/responsive";

function SaveToListButton({
  product,
  size = "medium",
  style,
  iconColor,
  onPress,
}) {
  const savedItemsCtx = useContext(SavedItemsContext);
  const authCtx = useContext(AuthContext);
  const { showToast } = useToast();
  const [animatedValue] = useState(new Animated.Value(1));

  const isSaved = savedItemsCtx.isSaved(product.id);

  const handlePress = async () => {
    // Call custom onPress if provided
    if (onPress) {
      onPress(product, isSaved);
      return;
    }

    // Check if user is authenticated
    if (!authCtx.isAuthenticated) {
      showToast("Please sign in to save items", "warning");
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (isSaved) {
        await savedItemsCtx.removeFromSaved(product.id);
        showToast("Removed from saved items", "success");
      } else {
        await savedItemsCtx.addToSaved(product);
        showToast("Added to saved items", "success");
      }
    } catch (error) {
      console.error("Error toggling saved item:", error);
      if (error.message === "Item is already saved") {
        showToast("Item is already in your saved list", "info");
      } else {
        showToast(
          isSaved ? "Failed to remove item" : "Failed to save item",
          "error"
        );
      }
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 28;
      default:
        return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small":
        return 32;
      case "large":
        return 44;
      default:
        return 36;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: isSaved ? Colors.accent500 : Colors.white,
            borderColor: isSaved ? Colors.accent500 : Colors.borderLight,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={savedItemsCtx.isLoading}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={iconSize}
          color={iconColor || (isSaved ? Colors.white : Colors.gray600)}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default SaveToListButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

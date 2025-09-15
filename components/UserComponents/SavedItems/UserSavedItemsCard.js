import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SavedItemsContext } from "../../../store/saved-items-context";
import { Colors } from "../../../constants/styles";
import { typography, spacing, scaleSize } from "../../../constants/responsive";
import { useNavigation } from "@react-navigation/native";
import UserCard from "../UserCard";
import { useI18n } from "../../../store/i18n-context";

function UserSavedItemsCard() {
  const { t } = useI18n();
  const savedItemsCtx = useContext(SavedItemsContext);
  const navigation = useNavigation();

  const handlePress = () => {
    // Navigate to SavedItemsScreen within UserStack
    navigation.navigate("SavedItemsScreen");
  };

  // Dynamic subtitle based on saved items count
  const getSubtitle = () => {
    const count = savedItemsCtx.getSavedItemsCount();
    if (count === 0) {
      return t("user.noSavedItems");
    }
    return t("user.savedItemsCount", {
      count,
      itemText: count === 1 ? t("user.item") : t("user.items"),
    });
  };

  // Custom UserCard with count badge if items exist
  return (
    <View style={styles.container}>
      <UserCard
        icon="heart"
        title={t("user.savedItems")}
        subtitle={getSubtitle()}
        onPress={handlePress}
      />
      {savedItemsCtx.getSavedItemsCount() > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {savedItemsCtx.getSavedItemsCount()}
          </Text>
        </View>
      )}
    </View>
  );
}

export default UserSavedItemsCard;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.sm,
    backgroundColor: Colors.accent500,
    borderRadius: scaleSize(12),
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: scaleSize(24),
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  countText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
});

import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  spacing,
  typography,
  scaleSize,
  iconSizes,
  deviceAdjustments,
} from "../../../constants/responsive";

function CategoryCard({
  category,
  productCount = 0,
  topBrands = [],
  onPress,
  style,
  compact = false,
}) {
  // Display brands or subcategories as subtitle
  const subtitle = useMemo(() => {
    if (topBrands.length > 0) {
      return topBrands.slice(0, 2).join(", ");
    }
    return `${productCount} products`;
  }, [topBrands, productCount]);

  const handlePress = () => {
    if (onPress) {
      onPress(category);
    }
  };

  // Dynamic styles based on category color
  const cardStyles = useMemo(
    () => ({
      container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: category.color,
      },
      iconContainer: {
        backgroundColor: `${category.color}15`, // 15% opacity
      },
      categoryBadge: {
        backgroundColor: category.color,
      },
    }),
    [category.color]
  );

  return (
    <Pressable
      style={[
        styles.container,
        cardStyles.container,
        compact && styles.containerCompact,
        style,
      ]}
      onPress={handlePress}
      android_ripple={{
        color: category.color,
        borderless: false,
        radius: scaleSize(8),
      }}
    >
      <View style={[styles.content, compact && styles.contentCompact]}>
        {/* Icon Section */}
        <View
          style={[
            styles.iconContainer,
            cardStyles.iconContainer,
            compact && styles.iconContainerCompact,
          ]}
        >
          <Ionicons
            name={category.icon}
            size={compact ? iconSizes.md : iconSizes.lg}
            color={category.color}
          />
        </View>

        {/* Text Section */}
        <View
          style={[styles.textContainer, compact && styles.textContainerCompact]}
        >
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, compact && styles.titleCompact]}
              numberOfLines={1}
            >
              {category.name}
            </Text>

            {!compact && (
              <View style={[styles.categoryBadge, cardStyles.categoryBadge]}>
                <Text style={styles.badgeText}>{productCount}</Text>
              </View>
            )}
          </View>

          {!compact && subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {category.description && !compact && (
            <Text style={styles.description} numberOfLines={1}>
              {category.description}
            </Text>
          )}
        </View>

        {/* Arrow Icon for navigation */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward"
            size={compact ? iconSizes.sm : iconSizes.md}
            color={Colors.gray500}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerCompact: {
    marginVertical: spacing.xs * 0.5,
    marginHorizontal: spacing.xs * 0.5,
    borderRadius: scaleSize(8),
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: scaleSize(80),
  },
  contentCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: scaleSize(60),
  },
  iconContainer: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  iconContainerCompact: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  textContainerCompact: {
    justifyContent: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs * 0.5,
  },
  title: {
    ...typography.heading4,
    color: Colors.gray900,
    fontWeight: "600",
    flex: 1,
  },
  titleCompact: {
    ...typography.body1,
    marginBottom: 0,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs * 0.5,
    borderRadius: scaleSize(12),
    marginLeft: spacing.sm,
  },
  badgeText: {
    ...typography.captionSmall,
    color: Colors.white,
    fontWeight: "700",
    fontSize: scaleSize(10),
  },
  subtitle: {
    ...typography.body2,
    color: Colors.gray700,
    marginBottom: spacing.xs * 0.25,
    fontWeight: "500",
  },
  description: {
    ...typography.caption,
    color: Colors.gray600,
    fontStyle: "italic",
  },
  arrowContainer: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default CategoryCard;

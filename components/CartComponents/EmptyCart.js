import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { useI18n } from "../../store/i18n-context";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  iconSizes,
  layout,
} from "../../constants/responsive";

function EmptyCart({ onRefresh, refreshing = false }) {
  const { t } = useI18n();

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Colors.primary500, Colors.accent500]}
      tintColor={Colors.primary500}
      title={t("cart.pullToRefreshCart")}
      titleColor={Colors.primary500}
    />
  ) : undefined;

  const content = (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="bag-outline"
          size={iconSizes.xxl}
          color={Colors.gray400}
          style={styles.icon}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t("cart.emptyCartTitle")}</Text>
        <Text style={styles.subtitle}>{t("cart.emptyCartSubtitle")}</Text>
      </View>
      {onRefresh && (
        <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={iconSizes.sm} color={Colors.white} />
          <Text style={styles.refreshButtonText}>{t("cart.refreshCart")}</Text>
        </Pressable>
      )}
    </View>
  );

  if (onRefresh) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={refreshControl}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

export default EmptyCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    backgroundColor: Colors.primary100,
  },
  iconContainer: {
    width: scaleSize(120),
    height: scaleSize(120),
    backgroundColor: Colors.white,
    borderRadius: scaleSize(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    opacity: 0.6,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: scaleSize(280),
  },
  refreshButton: {
    ...layout.flexRow,
    alignItems: "center",
    backgroundColor: Colors.accent500,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: scaleSize(25),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.accent500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    marginLeft: spacing.sm,
    ...typography.body,
    color: Colors.white,
    fontWeight: "600",
  },
});

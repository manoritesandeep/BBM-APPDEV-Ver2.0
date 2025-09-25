import { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";

import { ProductsContext } from "../../store/products-context";
import { Colors } from "../../constants/styles";
import ProductModal from "./ProductModal";
import CategoryCarousel from "./CategoryCarousel";
import LoadingState from "../UI/LoadingState";
import { groupProductsByName } from "../../util/groupedProductsByName";
import { UserContext } from "../../store/user-context";
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";
import DeliveryAddressSection from "../SearchComponents/DeliveryAddressSection";
import EmailVerificationBanner from "../UI/EmailVerificationBanner";
import { typography, spacing, scaleVertical } from "../../constants/responsive";
import { useI18n } from "../../store/i18n-context";
import { useTheme } from "../../store/theme-context";

// will add as a future feature
// import CategoryQuickPicker from "../MenuComponents/CategoryComponents/CategoryQuickPicker";
// import TrackOrderModal from "../TrackOrderModal";

function HomeScreenOutput({ navigation }) {
  const userCtx = useContext(UserContext);
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const userName = userCtx.user?.name || userCtx.user?.email;
  const { products, loading, error, refreshProducts } =
    useContext(ProductsContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // const [trackOrderVisible, setTrackOrderVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);

  // Safe check for products array
  const safeProducts = Array.isArray(products) ? products : [];

  // Group products by name (returns array of arrays)
  const groupedProducts = useMemo(
    () => (safeProducts.length > 0 ? groupProductsByName(safeProducts) : []),
    [safeProducts]
  );

  // Group product groups by category (using first product in each group for category)
  const productGroupsByCategory = useMemo(() => {
    const grouped = {};
    groupedProducts.forEach((group) => {
      const category = group[0]?.category;
      if (!category) return;
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(group);
    });
    return grouped;
  }, [groupedProducts]);

  // Get top-rated product groups for recommendations (rating >= 4)
  const recommendedProductGroups = useMemo(
    () =>
      groupedProducts
        .filter((group) => group[0]?.rating >= 4)
        .sort((a, b) => b[0].rating - a[0].rating)
        .slice(0, 10),
    [groupedProducts]
  );

  // For each category, get top 5 rated product groups
  const categoryCarousels = Object.entries(productGroupsByCategory).map(
    ([category, groups]) => ({
      category,
      products: groups.sort((a, b) => b[0].rating - a[0].rating).slice(0, 5),
    })
  );

  function handleProductPress(productGroup) {
    // Pass the first product in the group to the modal for now
    // Could be enhanced to pass the entire group if ProductDetailedSummary supports it
    const product = Array.isArray(productGroup)
      ? productGroup[0]
      : productGroup;
    setSelectedProduct(product);
  }

  function closeModal() {
    setSelectedProduct(null);
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProducts();
    } finally {
      setRefreshing(false);
    }
  };

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: colors.primary100,
    },
    welcomeTitle: {
      ...typography.h4,
      color: colors.accent500,
      marginLeft: spacing.xs,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    subtitle: {
      ...typography.bodyCompact,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: colors.primary500,
      padding: spacing.sm,
      borderRadius: scaleVertical(8),
      margin: spacing.md,
      alignItems: "center",
    },
    retryButtonText: {
      color: colors.white,
      fontWeight: "bold",
      ...typography.button,
    },
  });

  // Show loading state while products are being fetched
  if (loading) {
    return (
      <SafeAreaWrapper
        edges={["left", "right"]}
        backgroundColor={colors.background}
      >
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.welcomeTitle}>
            {t("home.welcomeUser", { userName })}
          </Text>
          <Text style={dynamicStyles.subtitle}>
            {t("home.discoverProducts")}
          </Text>
          <LoadingState type="skeleton-carousel" count={3} />
        </View>
      </SafeAreaWrapper>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <SafeAreaWrapper
        edges={["bottom", "left", "right"]}
        backgroundColor={colors.background}
      >
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.welcomeTitle}>
            {t("home.welcomeUser", { userName })}
          </Text>
          <Text style={dynamicStyles.subtitle}>
            {t("home.errorLoadingProducts")}
          </Text>
          <Pressable style={dynamicStyles.retryButton} onPress={handleRefresh}>
            <Text style={dynamicStyles.retryButtonText}>
              {t("common.retry")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={colors.background}
    >
      <ScrollView
        style={dynamicStyles.container}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary500, colors.accent500]}
            tintColor={colors.primary500}
            title={t("home.pullToRefresh")}
            titleColor={colors.primary500}
          />
        }
      >
        <DeliveryAddressSection />

        {/* Email Verification Banner - Only for users who have email but haven't verified */}
        {showVerificationBanner &&
          userCtx.user &&
          !userCtx.user.emailVerified &&
          userCtx.user.email &&
          userCtx.user.email.trim() !== "" && (
            <EmailVerificationBanner
              navigation={navigation}
              onDismiss={() => setShowVerificationBanner(false)}
            />
          )}

        <Text style={dynamicStyles.welcomeTitle} allowFontScaling={true}>
          {t("home.welcomeUser", { userName })}
        </Text>
        <Text style={dynamicStyles.subtitle} allowFontScaling={true}>
          {t("home.subtitle")}
        </Text>

        {/* <CategoryQuickPicker /> */}

        <CategoryCarousel
          title={t("home.recommendedForYou")}
          products={recommendedProductGroups}
          onProductPress={handleProductPress}
        />

        {categoryCarousels.map(({ category, products }) => (
          <CategoryCarousel
            key={category}
            title={category}
            products={products}
            onProductPress={handleProductPress}
          />
        ))}
      </ScrollView>
      {/* <TrackOrderModal
        visible={trackOrderVisible}
        onClose={() => setTrackOrderVisible(false)}
      /> */}

      <ProductModal
        visible={!!selectedProduct}
        onClose={closeModal}
        product={selectedProduct}
      />
    </SafeAreaWrapper>
  );
}

export default HomeScreenOutput;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";

import { Colors } from "../../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../../constants/responsive";
import { getAvailableCoupons } from "../../../util/couponUtils";

function CouponContent({ userId, cartTotal = 0 }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, [userId, cartTotal]);

  // Helper to format categories: capitalize and join with ', ' or commas
  const formatCategories = (categories) => {
    if (!categories || categories.length === 0) return "";
    const formatted = categories.map(
      (cat) => cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
    );
    return formatted.join(", ");
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      // For coupon listing page, show all available coupons regardless of user restrictions
      const result = await getAvailableCoupons(userId, cartTotal, true);
      if (result.success) {
        setCoupons(result.coupons);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCoupon = async (couponCode) => {
    try {
      Clipboard.setString(couponCode);
      setCopiedCoupon(couponCode);
      setTimeout(() => setCopiedCoupon(null), 2000);
    } catch (error) {
      console.error("Error copying coupon code:", error);
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      // const maxText = coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : "";
      return `${coupon.discountValue}%`; // return `${coupon.discountValue}% OFF${maxText}`;
    } else if (coupon.discountType === "fixed") {
      return `₹${coupon.discountValue} OFF`;
    } else if (coupon.discountType === "free_shipping") {
      return "FREE SHIPPING";
    }
    return "DISCOUNT";
  };

  const isExpiringSoon = (validUntil) => {
    if (!validUntil) return false;
    const today = new Date();
    const expiry = validUntil.toDate
      ? validUntil.toDate()
      : new Date(validUntil);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent500} />
        <Text style={styles.loadingText}>Loading available coupons...</Text>
      </View>
    );
  }

  if (coupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="gift-outline"
          size={iconSizes.xl}
          color={Colors.gray400}
        />
        <Text style={styles.emptyTitle}>No Coupons Available</Text>
        <Text style={styles.emptyDescription}>
          Check back later for exciting offers and discounts!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Coupons</Text>
        <Text style={styles.subtitle}>
          Tap to copy coupon code and use during checkout
        </Text>
      </View>

      {coupons.map((coupon) => (
        <Pressable
          key={coupon.id}
          style={[
            styles.couponCard,
            isExpiringSoon(coupon.validUntil) && styles.expiringSoon,
          ]}
          onPress={() => handleCopyCoupon(coupon.code)}
        >
          <View style={styles.couponHeader}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{formatDiscount(coupon)}</Text>
            </View>
            <View style={styles.copySection}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              <View style={styles.copyButton}>
                {copiedCoupon === coupon.code ? (
                  <Ionicons
                    name="checkmark"
                    size={iconSizes.sm}
                    color={Colors.success}
                  />
                ) : (
                  <Ionicons
                    name="copy-outline"
                    size={iconSizes.sm}
                    color={Colors.accent700}
                  />
                )}
              </View>
            </View>
          </View>

          <Text style={styles.couponTitle}>{coupon.title}</Text>
          <Text style={styles.couponDescription}>{coupon.description}</Text>

          <View style={styles.couponDetails}>
            {coupon.minOrderAmount && (
              <Text style={styles.detailText}>
                • Min order: ₹{coupon.minOrderAmount}
              </Text>
            )}
            {coupon.maxDiscount && (
              <Text style={styles.detailText}>
                • Max discount: ₹{coupon.maxDiscount}
              </Text>
            )}
            {coupon.applicableCategories &&
              coupon.applicableCategories.length > 0 && (
                <Text style={styles.detailText}>
                  • Applicable categories:{" "}
                  {formatCategories(coupon.applicableCategories)}
                </Text>
              )}
            {coupon.validUntil && (
              <Text
                style={[
                  styles.detailText,
                  isExpiringSoon(coupon.validUntil) && styles.expiringText,
                ]}
              >
                • Valid until: {coupon.validUntil.toDate().toLocaleDateString()}
              </Text>
            )}
          </View>

          {isExpiringSoon(coupon.validUntil) && (
            <View style={styles.expiringBadge}>
              <Text style={styles.expiringBadgeText}>Expiring Soon!</Text>
            </View>
          )}
        </Pressable>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • Coupons are subject to terms and conditions{"\n"}• Only one coupon
          can be applied per order{"\n"}• Coupons cannot be combined with other
          offers
        </Text>
      </View>
    </ScrollView>
  );
}

export default CouponContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
  },
  loadingText: {
    ...typography.body,
    color: Colors.gray600,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    color: Colors.gray700,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 22,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...typography.heading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: Colors.gray600,
  },
  couponCard: {
    backgroundColor: Colors.white,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: scaleSize(12),
    padding: spacing.lg,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  expiringSoon: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  couponHeader: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  discountBadge: {
    backgroundColor: Colors.accent700,
    borderRadius: scaleSize(6),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  discountText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: Colors.white,
  },
  copySection: {
    ...layout.flexRow,
    alignItems: "center",
    gap: spacing.sm,
  },
  couponCode: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  copyButton: {
    padding: spacing.xs,
  },
  couponTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  couponDescription: {
    ...typography.body,
    color: Colors.gray700,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  couponDetails: {
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: Colors.gray600,
    marginBottom: spacing.xs / 2,
  },
  expiringText: {
    color: Colors.warning,
    fontWeight: "500",
  },
  expiringBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: Colors.warning,
    borderRadius: scaleSize(4),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  expiringBadgeText: {
    ...typography.caption,
    fontWeight: "600",
    color: Colors.white,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: Colors.gray50,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: Colors.gray600,
    lineHeight: 16,
  },
});

import { Pressable, Text, View, StyleSheet, Image } from "react-native";
import { Colors } from "../../../constants/styles";
import CompactOrderTracking from "./CompactOrderTracking";
// import { useI18n } from "../../../hooks/useI18n";

import { useI18n } from "../../../store/i18n-context";

function OrderCard({ order, onPress }) {
  const { t } = useI18n();

  // Get first product image if available
  const firstItem =
    order.items && order.items.length > 0 ? order.items[0] : null;
  const imageUrl = firstItem && firstItem.imageUrl ? firstItem.imageUrl : null;
  const itemCount = order.items ? order.items.length : 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(order)}
      android_ripple={{ color: Colors.primary100 }}
    >
      <View style={styles.row}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          {itemCount > 1 && (
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>+{itemCount - 1}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>
              {t("user.orderNumber", { number: order.orderNumber })}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
          </Text>
          <Text style={styles.itemsText}>
            {t("user.itemCount", {
              count: itemCount,
              itemText: itemCount === 1 ? t("user.item") : t("user.items"),
            })}
          </Text>
          {order.appliedCoupon && (
            <Text style={styles.couponText}>
              {t("user.couponApplied", {
                code: order.appliedCoupon.code,
                amount:
                  order.appliedCoupon.discountAmount?.toFixed(2) || "0.00",
              })}
            </Text>
          )}
          <Text style={styles.totalText}>
            {t("user.orderTotal")}:{" "}
            <Text style={styles.totalAmount}>₹{order.total}</Text>
          </Text>

          {/* Compact Order Tracking */}
          <CompactOrderTracking order={order} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary50,
    borderRadius: 14,
    padding: 6,
    marginVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    minHeight: 80,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: Colors.primary100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginRight: 14,
  },
  image: {
    width: 60,
    height: 65,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
  },
  itemCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.accent500,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  itemCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 15,
    color: Colors.black,
    flex: 1,
  },
  dateText: {
    color: Colors.gray700,
    fontSize: 13,
    marginBottom: 2,
  },
  itemsText: {
    color: Colors.gray600,
    fontSize: 12,
    marginBottom: 2,
  },
  couponText: {
    color: Colors.success,
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 2,
  },
  totalText: {
    fontSize: 14,
    color: Colors.gray900,
    marginTop: 2,
  },
  totalAmount: {
    fontWeight: "bold",
    color: Colors.accent700,
  },
});

export default OrderCard;

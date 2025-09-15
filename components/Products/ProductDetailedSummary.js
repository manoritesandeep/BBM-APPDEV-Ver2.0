// // // component with product detailed Summary
// // // This should be a modal window which pops up after clicking ProductCard

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  // Platform,
} from "react-native";

import { Colors } from "../../constants/styles";

function ProductDetailedSummary({ product }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={
            product.imageUrl && product.imageUrl.trim() !== ""
              ? { uri: product.imageUrl }
              : require("../../assets/placeholder.png")
          }
          style={[
            styles.image,
            (!product.imageUrl || product.imageUrl.trim() === "") &&
              styles.placeholderImage,
          ]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{product.productName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.discount > 0 && (
            <Text style={styles.discount}>₹{product.discount} OFF</Text>
          )}
        </View>
        <Text style={styles.unitPrice}>Unit Price: ₹{product.unitPrice}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{product.brand}</Text>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{product.category}</Text>
            <Text style={styles.label}>Subcategory</Text>
            <Text style={styles.value}>{product.subCategory}</Text>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>{product.sizes || "N/A"}</Text>
            <Text style={styles.label}>Color</Text>
            <Text style={styles.value}>{product.colour || "N/A"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>HSN</Text>
            <Text style={styles.value}>{product.HSN || "N/A"}</Text>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{product.quantity}</Text>
            <Text style={styles.label}>Rating</Text>
            <Text style={styles.value}>{product.rating} ⭐</Text>
            <Text style={styles.label}>Material</Text>
            <Text style={styles.value}>{product.material || "N/A"}</Text>
            <Text style={styles.label}>Rentable</Text>
            <Text style={styles.value}>{product.rentable ? "Yes" : "No"}</Text>
            <Text style={styles.label}>Returnable</Text>
            <Text style={styles.value}>
              {product.isReturnable ? "Yes" : "No"}
            </Text>
          </View>
        </View>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{product.description}</Text>
      </View>
    </ScrollView>
  );
}

export default ProductDetailedSummary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 24,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 0,
  },
  image: {
    width: "85%",
    aspectRatio: 1,
    maxWidth: 400,
    minWidth: 200,
    alignSelf: "center",
    borderRadius: 18,
    // backgroundColor: Colors.gray300,
    marginBottom: 0,
    marginTop: 0,
    padding: 10,
  },
  placeholderImage: {
    width: "60%",
    aspectRatio: 1,
    minWidth: 120,
    maxWidth: 260,
    alignSelf: "center",
  },
  card: {
    width: "96%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 8,
    color: Colors.primary700,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary500,
    marginRight: 8,
  },
  discount: {
    fontSize: 15,
    color: "#e63946",
    fontWeight: "bold",
    backgroundColor: "#ffeaea",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  unitPrice: {
    fontSize: 14,
    color: Colors.primary700,
    marginBottom: 8,
    fontWeight: "600",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
    gap: 12,
  },
  infoCol: {
    flex: 1,
    minWidth: 120,
    maxWidth: "50%",
  },
  label: {
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 6,
    color: Colors.primary500,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  value: {
    fontWeight: "normal",
    color: "#222",
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
});

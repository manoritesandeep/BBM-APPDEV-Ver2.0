import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import ProductCard from "./ProductCard";
import ProductModal from "../HomeComponents/ProductModal";
// import IconButton from "../UI/IconButton";
import { Colors } from "../../constants/styles";
import {
  getDeviceSize,
  isTablet,
  scaleSize,
  spacing,
  getComponentSizes,
  // getOrientation,
} from "../../constants/responsive";
import { useDeviceOrientation } from "../../hooks/useResponsive";

function ProductList({ products, onRefresh, refreshing = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { orientation, isLandscape } = useDeviceOrientation();

  // Dynamically calculate number of columns based on device size and orientation
  const { width: screenWidth } = useWindowDimensions();
  const deviceSize = getDeviceSize(orientation);
  const componentSizes = getComponentSizes(orientation);

  const getNumColumns = () => {
    const cardWidth = componentSizes.productCard.width;
    const availableWidth = screenWidth - spacing.sm * 2; // Account for container padding
    const columns = Math.floor(availableWidth / (cardWidth + spacing.xs));

    // Orientation-aware column counts
    if (isTablet()) {
      return isLandscape
        ? Math.max(5, Math.min(8, columns)) // More columns in landscape
        : Math.max(4, Math.min(6, columns)); // Standard tablet columns
    } else {
      return isLandscape
        ? Math.max(4, Math.min(6, columns)) // More columns in landscape phones
        : Math.max(3, Math.min(4, columns)); // Standard phone columns
    }
  };

  const numColumns = getNumColumns();

  function handleCardPress(product) {
    setSelectedProduct(product);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedProduct(null);
  }

  function renderProductCard(itemData) {
    return (
      <View style={styles.productContainer}>
        <ProductCard productGroup={itemData.item} onPress={handleCardPress} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item[0].id.toString()}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={{ paddingBottom: 2 }} // Minimal padding for better space utilization
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary500, Colors.accent500]}
              tintColor={Colors.primary500}
              title="Pull to refresh products"
              titleColor={Colors.accent700}
            />
          ) : undefined
        }
      />

      <ProductModal
        visible={modalVisible}
        onClose={closeModal}
        product={selectedProduct}
      />
    </View>
  );
}

export default ProductList;

const styles = StyleSheet.create({
  productContainer: {
    flex: 1,
    marginHorizontal: spacing.sm * 0.25, // Minimal margins for density
    marginVertical: spacing.xs * 0.25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    elevation: 10,
    minHeight: scaleSize(320),
  },
});

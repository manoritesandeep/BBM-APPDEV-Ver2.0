import React from "react";
import { Modal, View, Pressable, Text, StyleSheet } from "react-native";
import ProductDetailedSummary from "../Products/ProductDetailedSummary";

const ProductModal = ({ visible, onClose, product }) => {
  return (
    <Modal
      visible={!!product && visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.overlayTouchable}
          onPress={onClose}
          accessibilityLabel="Close product details"
        />
        <View style={styles.modalContent}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close product details"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <View style={styles.swipeBarContainer}>
            <View style={styles.swipeBar} />
          </View>
          {product && <ProductDetailedSummary product={product} />}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  modalContent: {
    width: "100%",
    minHeight: "80%",
    maxHeight: "96%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 16,
    elevation: 12,
    position: "relative",
    overflow: "hidden",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 18,
    zIndex: 3,
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 2,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  closeButtonText: {
    fontSize: 26,
    color: "#333",
    fontWeight: "bold",
  },
  swipeBarContainer: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: -18,
  },
  swipeBar: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
});

export default ProductModal;

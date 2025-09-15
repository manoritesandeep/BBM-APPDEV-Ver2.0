import React from "react";
import { View, StyleSheet } from "react-native";
import LoadingOverlay from "./LoadingOverlay";
import {
  ProductCardSkeleton,
  CategoryCarouselSkeleton,
  CartSkeleton,
} from "./SkeletonLoader";

const LoadingState = ({
  type = "overlay",
  message,
  count = 1,
  fullScreen = true,
  style,
}) => {
  switch (type) {
    case "skeleton-products":
      return (
        <View style={[styles.skeletonContainer, style]}>
          {Array.from({ length: count }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </View>
      );

    case "skeleton-carousel":
      return (
        <View style={[styles.carouselContainer, style]}>
          {Array.from({ length: count }, (_, index) => (
            <CategoryCarouselSkeleton key={index} />
          ))}
        </View>
      );

    case "skeleton-cart":
      return (
        <View style={[styles.cartContainer, style]}>
          <CartSkeleton />
        </View>
      );

    case "overlay":
    default:
      return (
        <LoadingOverlay
          message={message}
          fullScreen={fullScreen}
          style={style}
        />
      );
  }
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  carouselContainer: {
    flex: 1,
  },
});

export default LoadingState;

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/styles";

const SkeletonLoader = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  animationSpeed = 1000,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationSpeed,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [animatedValue, animationSpeed]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <SkeletonLoader height={120} borderRadius={8} style={styles.productImage} />
    <View style={styles.productInfo}>
      <SkeletonLoader height={16} width="80%" style={styles.productTitle} />
      <SkeletonLoader height={14} width="60%" style={styles.productPrice} />
      <SkeletonLoader height={12} width="40%" style={styles.productRating} />
    </View>
  </View>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <View style={styles.listItem}>
    <SkeletonLoader width={60} height={60} borderRadius={8} />
    <View style={styles.listItemContent}>
      <SkeletonLoader height={16} width="70%" />
      <SkeletonLoader height={14} width="50%" style={{ marginTop: 8 }} />
    </View>
  </View>
);

// Category Carousel Skeleton
export const CategoryCarouselSkeleton = () => (
  <View style={styles.carousel}>
    <SkeletonLoader height={20} width="40%" style={styles.carouselTitle} />
    <View style={styles.carouselItems}>
      {[1, 2, 3].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  </View>
);

// Cart Item Skeleton
export const CartItemSkeleton = () => (
  <View style={styles.cartItem}>
    <SkeletonLoader width={80} height={80} borderRadius={8} />
    <View style={styles.cartItemContent}>
      <SkeletonLoader height={18} width="70%" />
      <SkeletonLoader height={16} width="50%" style={{ marginTop: 6 }} />
      <View style={styles.cartItemFooter}>
        <SkeletonLoader height={14} width="30%" />
        <SkeletonLoader height={32} width={100} borderRadius={6} />
      </View>
    </View>
  </View>
);

// Cart Loading Skeleton
export const CartSkeleton = () => (
  <View style={styles.cartContainer}>
    {[1, 2, 3, 4].map((_, index) => (
      <CartItemSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray200 || "#e0e0e0",
  },
  productCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    marginBottom: 8,
  },
  productInfo: {
    gap: 6,
  },
  productTitle: {
    marginBottom: 4,
  },
  productPrice: {
    marginBottom: 4,
  },
  productRating: {},
  listItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  carousel: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  carouselTitle: {
    marginBottom: 12,
  },
  carouselItems: {
    flexDirection: "row",
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cartItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cartContainer: {
    padding: 8,
  },
});

export default SkeletonLoader;

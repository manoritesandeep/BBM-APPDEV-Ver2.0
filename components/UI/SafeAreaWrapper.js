import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  getSafeAreaPadding,
  scaleVertical,
  isTablet,
} from "../../constants/responsive";
import { useDeviceOrientation } from "../../hooks/useResponsive";

// Main SafeAreaProvider wrapper for the entire app
export function SafeAreaProviderWrapper({ children }) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}

// SafeAreaView wrapper for screens with responsive padding and orientation awareness
export function SafeAreaWrapper({
  children,
  style,
  edges = ["top", "left", "right"], // Remove bottom edge by default
  backgroundColor = "transparent",
}) {
  const { orientation } = useDeviceOrientation();
  const safeAreaPadding = getSafeAreaPadding();

  // Adjust edges based on orientation and device type
  const getAdjustedEdges = () => {
    if (orientation === "landscape" && !isTablet) {
      // For phones in landscape, be more conservative with safe areas
      return edges.filter((edge) => edge !== "top");
    }
    return edges;
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor },
        Platform.OS === "android" && safeAreaPadding,
        style,
      ]}
      edges={getAdjustedEdges()}
    >
      {children}
    </SafeAreaView>
  );
}

// Custom hook to get safe area insets
export function useSafeArea() {
  return useSafeAreaInsets();
}

// Header safe area component specifically for headers with orientation support
export function HeaderSafeArea({ children, backgroundColor, style }) {
  const insets = useSafeAreaInsets();
  const { orientation } = useDeviceOrientation();

  // Orientation-aware padding
  const getPaddingTop = () => {
    if (orientation === "landscape" && !isTablet) {
      // Reduced padding for landscape phones
      return Math.max(insets.top, scaleVertical(10));
    }
    return Math.max(insets.top, scaleVertical(20));
  };

  return (
    <View
      style={[
        {
          paddingTop: getPaddingTop(),
          backgroundColor: backgroundColor || "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Safe area wrapper that only handles top inset with orientation awareness
export function TopSafeAreaWrapper({ children, backgroundColor, style }) {
  const insets = useSafeAreaInsets();
  const { orientation } = useDeviceOrientation();

  // Orientation-aware padding
  const getPaddingTop = () => {
    if (orientation === "landscape" && !isTablet) {
      // Reduced padding for landscape phones
      return Math.max(insets.top, scaleVertical(10));
    }
    return Math.max(insets.top, scaleVertical(20));
  };

  return (
    <View
      style={[
        {
          paddingTop: getPaddingTop(),
          backgroundColor: backgroundColor || "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;

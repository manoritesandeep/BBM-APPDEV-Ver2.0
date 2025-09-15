import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  FlatList,
  SectionList,
} from "react-native";
import { Colors } from "../../constants/styles";

const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  colors = [Colors.primary500, Colors.accent500],
  tintColor = Colors.primary500,
  title = "Pull to refresh",
  renderAs = "scrollview", // "scrollview", "flatlist", "auto"
  data = [], // For FlatList mode
  renderItem, // For FlatList mode
  keyExtractor, // For FlatList mode
  ...scrollViewProps
}) => {
  const [isRefreshing, setIsRefreshing] = useState(refreshing);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing || refreshing}
      onRefresh={handleRefresh}
      colors={colors}
      tintColor={tintColor}
      title={title}
      titleColor={tintColor}
    />
  );

  // Auto-detect if children contain FlatList/SectionList
  const containsVirtualizedList =
    renderAs === "auto" &&
    React.Children.toArray(children).some(
      (child) =>
        child?.type === FlatList ||
        child?.type === SectionList ||
        child?.props?.children?.type === FlatList ||
        child?.props?.children?.type === SectionList
    );

  // If we're in FlatList mode or auto-detected virtualized content
  if (renderAs === "flatlist" || containsVirtualizedList) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        {...scrollViewProps}
      />
    );
  }

  // Default ScrollView mode
  return (
    <ScrollView {...scrollViewProps} refreshControl={refreshControl}>
      {children}
    </ScrollView>
  );
};

export default PullToRefresh;

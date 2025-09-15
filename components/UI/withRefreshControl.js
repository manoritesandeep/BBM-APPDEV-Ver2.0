import React from "react";
import { RefreshControl } from "react-native";
import { Colors } from "../../constants/styles";

/**
 * Higher Order Component to add refresh control to any FlatList or SectionList
 * This avoids the VirtualizedList nesting issue by directly adding RefreshControl
 * to the list component instead of wrapping it in ScrollView
 */
const withRefreshControl = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const {
      onRefresh,
      refreshing = false,
      refreshColors = [Colors.primary500, Colors.accent500],
      refreshTintColor = Colors.primary500,
      refreshTitle = "Pull to refresh",
      ...otherProps
    } = props;

    const refreshControl = onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={refreshColors}
        tintColor={refreshTintColor}
        title={refreshTitle}
        titleColor={refreshTintColor}
      />
    ) : undefined;

    return (
      <WrappedComponent
        ref={ref}
        refreshControl={refreshControl}
        {...otherProps}
      />
    );
  });
};

export default withRefreshControl;

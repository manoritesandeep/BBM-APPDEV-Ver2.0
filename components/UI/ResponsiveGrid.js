import React from "react";
import { View, StyleSheet } from "react-native";
import {
  getDeviceSize,
  isTablet,
  responsiveWidth,
  spacing,
  scaleSize,
} from "../../constants/responsive";

export const ResponsiveGrid = ({
  children,
  numColumns,
  spacing: gridSpacing = spacing.sm,
  style,
}) => {
  const deviceSize = getDeviceSize();

  // Adjust number of columns based on device size
  const getResponsiveColumns = () => {
    if (numColumns) return numColumns;

    switch (deviceSize) {
      case "small":
        return 2;
      case "medium":
        return 2;
      case "large":
        return 3;
      case "tablet":
        return 4;
      default:
        return 2;
    }
  };

  const columns = getResponsiveColumns();
  const itemWidth = (100 - gridSpacing * (columns - 1)) / columns;

  const renderGrid = () => {
    const rows = [];
    const childrenArray = React.Children.toArray(children);

    for (let i = 0; i < childrenArray.length; i += columns) {
      const rowChildren = childrenArray.slice(i, i + columns);

      rows.push(
        <View key={i} style={styles.row}>
          {rowChildren.map((child, index) => (
            <View
              key={index}
              style={[
                styles.item,
                {
                  width: `${itemWidth}%`,
                  marginRight: index < rowChildren.length - 1 ? gridSpacing : 0,
                },
              ]}
            >
              {child}
            </View>
          ))}
          {/* Fill empty spaces in the last row */}
          {rowChildren.length < columns &&
            Array(columns - rowChildren.length)
              .fill(null)
              .map((_, index) => (
                <View
                  key={`empty-${index}`}
                  style={{ width: `${itemWidth}%` }}
                />
              ))}
        </View>
      );
    }

    return rows;
  };

  return <View style={[styles.container, style]}>{renderGrid()}</View>;
};

export const ResponsiveContainer = ({ children, style, maxWidth }) => {
  const deviceSize = getDeviceSize();

  const getContainerStyle = () => {
    const baseStyle = {
      flex: 1,
      paddingHorizontal: spacing.md,
    };

    if (isTablet() && maxWidth) {
      return {
        ...baseStyle,
        maxWidth: scaleSize(maxWidth),
        alignSelf: "center",
        width: "100%",
      };
    }

    return baseStyle;
  };

  return <View style={[getContainerStyle(), style]}>{children}</View>;
};

export const ResponsiveRow = ({
  children,
  spacing: rowSpacing = spacing.sm,
  style,
}) => {
  return (
    <View style={[styles.row, { gap: rowSpacing }, style]}>{children}</View>
  );
};

export const ResponsiveColumn = ({
  children,
  spacing: colSpacing = spacing.sm,
  style,
}) => {
  return (
    <View style={[styles.column, { gap: colSpacing }, style]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  column: {
    flexDirection: "column",
  },
  item: {
    // Individual grid item styles
  },
});

export default ResponsiveGrid;

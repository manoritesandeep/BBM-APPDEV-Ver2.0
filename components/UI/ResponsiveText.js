import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { typography, getAccessibleFontSize } from "../../constants/responsive";

export const ResponsiveText = ({
  variant = "body",
  size,
  style,
  children,
  maxFontSizeMultiplier = 1.5,
  adjustsFontSizeToFit = false,
  numberOfLines,
  allowFontScaling = true,
  ...props
}) => {
  const getTextStyle = () => {
    if (size) {
      return {
        fontSize: getAccessibleFontSize(size),
        lineHeight: getAccessibleFontSize(size * 1.4),
      };
    }

    return typography[variant] || typography.body;
  };

  return (
    <RNText
      style={[getTextStyle(), style]}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Predefined text components for common use cases
export const Heading1 = (props) => <ResponsiveText variant="h1" {...props} />;

export const Heading2 = (props) => <ResponsiveText variant="h2" {...props} />;

export const Heading3 = (props) => <ResponsiveText variant="h3" {...props} />;

export const Heading4 = (props) => <ResponsiveText variant="h4" {...props} />;

export const BodyText = (props) => <ResponsiveText variant="body" {...props} />;

export const BodySmall = (props) => (
  <ResponsiveText variant="bodySmall" {...props} />
);

export const Caption = (props) => (
  <ResponsiveText variant="caption" {...props} />
);

export const ButtonText = (props) => (
  <ResponsiveText variant="button" {...props} />
);

export const ButtonSmallText = (props) => (
  <ResponsiveText variant="buttonSmall" {...props} />
);

export default ResponsiveText;

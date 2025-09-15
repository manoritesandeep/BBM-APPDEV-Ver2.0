import { useTheme } from "../store/theme-context";
import { useI18n } from "../store/i18n-context";

/**
 * Custom hook that provides both theme and i18n functionality
 * @returns {Object} Combined theme and i18n utilities
 */
export const useAppStyles = () => {
  const theme = useTheme();
  const i18n = useI18n();

  return {
    ...theme,
    ...i18n,
    // Helper function to create theme-aware styles
    createStyles: (styleFunction) => styleFunction(theme.colors, theme.isDark),
  };
};

/**
 * Helper function to merge default styles with theme-aware styles
 * @param {Object} defaultStyles - Base styles
 * @param {Function} themeStyles - Function that returns theme-specific styles
 * @param {Object} colors - Theme colors
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {Object} Merged styles
 */
export const mergeStyles = (defaultStyles, themeStyles, colors, isDark) => {
  return {
    ...defaultStyles,
    ...themeStyles(colors, isDark),
  };
};

/**
 * Helper function to get responsive font sizes
 * @param {string} size - Size key (small, medium, large, xlarge)
 * @returns {number} Font size
 */
export const getFontSize = (size) => {
  const sizes = {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
  };
  return sizes[size] || sizes.medium;
};

/**
 * Helper function to get responsive spacing
 * @param {string} size - Size key (xs, sm, md, lg, xl)
 * @returns {number} Spacing value
 */
export const getSpacing = (size) => {
  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  };
  return spacing[size] || spacing.md;
};

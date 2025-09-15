import { Dimensions, Platform, PixelRatio } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// -----------------------------
// Constants (centralized scaling bounds)
// -----------------------------
const BASE_WIDTH = 375; // design width (iPhone 8)
const BASE_HEIGHT = 667; // design height
const MAX_UI_SCALE = 1.1; // maximum multiplier for UI elements
const MIN_UI_SCALE = 0.6; // minimum multiplier for UI elements
const MAX_FONT_SCALE = Platform.OS === "android" ? 0.8 : 1.1;
const MIN_FONT_SCALE = 0.8;

// -----------------------------
// Central scaling pipeline
// -----------------------------
const getDimensions = () => Dimensions.get("window");

const computeCentralScales = () => {
  const { width, height } = getDimensions();

  const rawScale = width / BASE_WIDTH;
  const uiScale = Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, rawScale));

  const rawVScale = height / BASE_HEIGHT;
  const vScale = Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, rawVScale));

  const rawFontScale = PixelRatio.getFontScale();
  const fontScale = Math.min(
    MAX_FONT_SCALE,
    Math.max(MIN_FONT_SCALE, rawFontScale)
  );

  return {
    uiScale,
    vScale,
    fontScale,
    width,
    height,
  };
};

// -----------------------------
// Orientation and Device helpers
// -----------------------------
export const getOrientation = () => {
  try {
    const { width, height } = getDimensions();
    return width > height ? "landscape" : "portrait";
  } catch {
    return "portrait";
  }
};

export const getCurrentDimensions = () => {
  try {
    return getDimensions();
  } catch {
    return { width: 375, height: 667 };
  }
};

export const isTablet = () => {
  try {
    const { width, height } = getDimensions();
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = width * pixelDensity;
    const adjustedHeight = height * pixelDensity;

    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000))
      return true;
    return (
      pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
    );
  } catch {
    return false;
  }
};

export const getDeviceSize = (orientation = null) => {
  const currentOrientation = orientation || getOrientation();
  const { width } = getCurrentDimensions();

  if (isTablet()) return "tablet";

  if (currentOrientation === "landscape") {
    if (width < 667) return "medium";
    if (width >= 667 && width < 896) return "large";
    return "xlarge";
  } else {
    if (width < 375) return "small";
    if (width >= 375 && width < 414) return "medium";
    return "large";
  }
};

export const getScreenData = () => {
  try {
    const dimensions = getCurrentDimensions();
    const orientation = getOrientation();
    return {
      width: dimensions.width,
      height: dimensions.height,
      orientation,
      deviceSize: getDeviceSize(orientation),
      isTablet: isTablet(),
      isSmallDevice: dimensions.width < 375,
      isLandscape: orientation === "landscape",
      isPortrait: orientation === "portrait",
      isIOS: Platform.OS === "ios",
      isAndroid: Platform.OS === "android",
    };
  } catch {
    return {
      width: 375,
      height: 667,
      orientation: "portrait",
      deviceSize: "medium",
      isTablet: false,
      isSmallDevice: false,
      isLandscape: false,
      isPortrait: true,
      isIOS: Platform.OS === "ios",
      isAndroid: Platform.OS === "android",
    };
  }
};

export const screenData = getScreenData();

// -----------------------------
// Scaling utilities
// -----------------------------
export const responsiveWidth = (percentage) => wp(percentage);
export const responsiveHeight = (percentage) => hp(percentage);

export const scaleSize = (size) => {
  const { uiScale } = computeCentralScales();
  return Math.round(size * uiScale);
};

export const scaleVertical = (size) => {
  const { vScale } = computeCentralScales();
  return Math.round(size * vScale);
};

// Better scaling: considers UI scale and font scale
export const scaleFont = (size, factor = 1) => {
  const { uiScale, fontScale } = computeCentralScales();
  return Math.round(size * uiScale * factor * fontScale);
};

// Dynamic font scaling
export const getAccessibleFontSize = (baseSize, options = {}) => {
  const {
    maxScale = MAX_FONT_SCALE,
    minScale = MIN_FONT_SCALE,
    useUiScale = false,
    adjustHeight = true,
  } = options;
  const { fontScale, uiScale } = computeCentralScales();

  const boundedFontScale = Math.max(minScale, Math.min(maxScale, fontScale));
  let result = baseSize * boundedFontScale;
  if (useUiScale) {
    result *= uiScale;
  }

  if (adjustHeight && boundedFontScale > 1.2) {
    result += Math.ceil(baseSize * 0.15);
  }

  return Math.round(result);
};

// -----------------------------
// Wrapping helper for text
// -----------------------------
export const autoWrapText = {
  flexShrink: 1,
  flexWrap: "wrap",
  minWidth: 0,
  numberOfLines: undefined,
};

// -----------------------------
// Spacing
// -----------------------------
export const spacing = {
  xs: scaleSize(2),
  sm: scaleSize(4),
  md: scaleSize(8),
  lg: scaleSize(12),
  xl: scaleSize(16),
  xxl: scaleSize(24),
};

export const getResponsiveSpacing = (base, orientation = null) => {
  const currentOrientation = orientation || getOrientation();
  const deviceSize = getDeviceSize(currentOrientation);
  const { uiScale } = computeCentralScales();

  let multiplier;
  switch (deviceSize) {
    case "small":
      multiplier = 0.8;
      break;
    case "medium":
      multiplier = 1;
      break;
    case "large":
      multiplier = 1.1;
      break;
    case "xlarge":
      multiplier = 1.2;
      break;
    case "tablet":
      multiplier = 1.3;
      break;
    default:
      multiplier = 1;
  }
  if (currentOrientation === "landscape") multiplier *= 1.1;

  const result = base * uiScale * multiplier;
  const maxResult = base * MAX_UI_SCALE * 1.3;
  const minResult = base * MIN_UI_SCALE * 0.8;

  return Math.round(Math.max(minResult, Math.min(maxResult, result)));
};

// -----------------------------
// Typography
// -----------------------------
export const typography = {
  h1: {
    fontSize: getAccessibleFontSize(28),
    fontWeight: "bold",
    lineHeight: getAccessibleFontSize(34),
  },
  h2: {
    fontSize: getAccessibleFontSize(24),
    fontWeight: "bold",
    lineHeight: getAccessibleFontSize(30),
  },
  h3: {
    fontSize: getAccessibleFontSize(20),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(26),
  },
  h4: {
    fontSize: getAccessibleFontSize(18),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(24),
  },
  h5: {
    fontSize: getAccessibleFontSize(16),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(22),
  },
  h6: {
    fontSize: getAccessibleFontSize(14),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(20),
  },
  body: {
    fontSize: getAccessibleFontSize(16),
    lineHeight: getAccessibleFontSize(22),
  },
  bodySmall: {
    fontSize: getAccessibleFontSize(14),
    lineHeight: getAccessibleFontSize(20),
  },
  bodyCompact: {
    fontSize: getAccessibleFontSize(12),
    lineHeight: getAccessibleFontSize(16),
    fontWeight: "600",
  },
  caption: {
    fontSize: getAccessibleFontSize(12),
    lineHeight: getAccessibleFontSize(16),
  },
  captionMedium: {
    fontSize: getAccessibleFontSize(11),
    lineHeight: getAccessibleFontSize(15),
  },
  captionSmall: {
    fontSize: getAccessibleFontSize(10),
    lineHeight: getAccessibleFontSize(14),
  },
  button: {
    fontSize: getAccessibleFontSize(16),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(20),
  },
  buttonSmall: {
    fontSize: getAccessibleFontSize(14),
    fontWeight: "600",
    lineHeight: getAccessibleFontSize(18),
  },
};

// -----------------------------
// Adaptive Component Sizes
// -----------------------------
export const getComponentSizes = (orientation = null) => {
  const currentOrientation = orientation || getOrientation();
  const { fontScale } = computeCentralScales();
  const isLandscape = currentOrientation === "landscape";

  const heightMultiplier = fontScale > 1.2 ? fontScale * 0.9 : 1;

  return {
    button: {
      small: {
        minHeight: Math.round(scaleVertical(32) * heightMultiplier),
        paddingHorizontal: scaleSize(12),
        paddingVertical: scaleVertical(6),
      },
      medium: {
        minHeight: Math.round(scaleVertical(38) * heightMultiplier),
        paddingHorizontal: scaleSize(16),
        paddingVertical: scaleVertical(10),
      },
      large: {
        minHeight: Math.round(scaleVertical(44) * heightMultiplier),
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleVertical(12),
      },
    },
    input: {
      minHeight: Math.round(scaleVertical(42) * heightMultiplier),
      paddingHorizontal: scaleSize(14),
      paddingVertical: scaleVertical(10),
    },
    card: {
      borderRadius: scaleSize(6),
      padding: scaleSize(8),
      margin: scaleSize(3),
    },
    productCard: {
      width: isLandscape
        ? Math.max(scaleSize(110), responsiveWidth(22))
        : Math.max(scaleSize(120), responsiveWidth(28)),
      minHeight: isLandscape
        ? scaleVertical(140) * heightMultiplier
        : scaleVertical(160) * heightMultiplier,
    },
  };
};

// -----------------------------
// Misc helpers
// -----------------------------
export const getSafeAreaPadding = () => {
  if (Platform.OS === "ios") {
    const { height } = getCurrentDimensions();
    if (height >= 812) {
      return {
        paddingTop: Math.round(scaleVertical(44)),
        paddingBottom: 0,
      };
    }
    return {
      paddingTop: Math.round(scaleVertical(20)),
      paddingBottom: 0,
    };
  }
  return { paddingTop: 0, paddingBottom: 0 };
};

export const iconSizes = {
  xs: scaleSize(12),
  sm: scaleSize(16),
  md: scaleSize(20),
  lg: scaleSize(24),
  xl: scaleSize(28),
  xxl: scaleSize(32),
};

export const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
  xlarge: 1024,
};

export const responsive = (styles, orientation = null) => {
  const currentOrientation = orientation || getOrientation();
  const deviceSize = getDeviceSize(currentOrientation);
  const screenData = getScreenData();

  if (typeof styles === "function") {
    return styles({
      deviceSize,
      orientation: currentOrientation,
      ...screenData,
    });
  }

  if (styles[currentOrientation]) {
    const orientationStyles = styles[currentOrientation];
    if (orientationStyles[deviceSize]) {
      return {
        ...styles.default,
        ...orientationStyles.default,
        ...orientationStyles[deviceSize],
      };
    }
    return { ...styles.default, ...orientationStyles.default };
  }

  if (styles[deviceSize]) {
    return { ...styles.default, ...styles[deviceSize] };
  }

  return styles.default || styles;
};

export const layout = {
  flex: { flex: 1 },
  flexRow: { flexDirection: "row" },
  flexColumn: { flexDirection: "column" },
  center: { justifyContent: "center", alignItems: "center" },
  centerHorizontal: { alignItems: "center" },
  centerVertical: { justifyContent: "center" },
  spaceBetween: { justifyContent: "space-between" },
  spaceAround: { justifyContent: "space-around" },
  spaceEvenly: { justifyContent: "space-evenly" },
  container: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(spacing.md),
  },
  section: { marginBottom: scaleVertical(16) },
};

export const grid = {
  col2: { width: `${(100 - 2) / 2}%`, marginRight: "2%" },
  col2Last: { width: `${(100 - 2) / 2}%` },
  col3: { width: `${(100 - 4) / 3}%`, marginRight: "2%" },
  col3Last: { width: `${(100 - 4) / 3}%` },
  col4: { width: `${(100 - 6) / 4}%`, marginRight: "2%" },
  col4Last: { width: `${(100 - 6) / 4}%` },
};

export const deviceAdjustments = {
  minTouchTarget: Math.max(44, scaleSize(44)),
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: { elevation: 4 },
  }),
  borderRadius: Platform.select({
    ios: scaleSize(12),
    android: scaleSize(8),
  }),
};

export default {
  getOrientation,
  getCurrentDimensions,
  responsiveWidth,
  responsiveHeight,
  scaleSize,
  scaleVertical,
  scaleFont,
  getAccessibleFontSize,
  spacing,
  getResponsiveSpacing,
  typography,
  getComponentSizes,
  getSafeAreaPadding,
  iconSizes,
  breakpoints,
  responsive,
  layout,
  grid,
  deviceAdjustments,
  isTablet,
  getDeviceSize,
  getScreenData,
  screenData,
  autoWrapText,
};

// import { Dimensions, Platform, PixelRatio } from "react-native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// // -----------------------------
// // Constants (centralized scaling bounds)
// // -----------------------------
// const BASE_WIDTH = 375; // design width (iPhone 8)
// const BASE_HEIGHT = 667; // design height
// const MAX_UI_SCALE = 1.3; // maximum multiplier for UI elements
// const MIN_UI_SCALE = 0.85; // minimum multiplier for UI elements
// const MAX_FONT_SCALE = 1.4; // maximum accessibility font multiplier
// const MIN_FONT_SCALE = 0.85; // minimum accessibility font multiplier

// // -----------------------------
// // Central scaling pipeline (single source of truth)
// // -----------------------------
// const getDimensions = () => Dimensions.get("window");

// // computeCentralScales: one place to compute all multipliers
// const computeCentralScales = () => {
//   const { width, height } = getDimensions();

//   // Linear scale based on width relative to design base width
//   const rawScale = width / BASE_WIDTH;
//   const uiScale = Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, rawScale));

//   // Vertical scale uses height ratio with consistent clamping
//   const rawVScale = height / BASE_HEIGHT;
//   const vScale = Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, rawVScale));

//   // Font scale uses PixelRatio.getFontScale() (accessibility setting)
//   const rawFontScale = PixelRatio.getFontScale();
//   const fontScale = Math.min(
//     MAX_FONT_SCALE,
//     Math.max(MIN_FONT_SCALE, rawFontScale)
//   );

//   return {
//     uiScale,
//     vScale,
//     fontScale,
//     width,
//     height,
//   };
// };

// // Orientation detection
// export const getOrientation = () => {
//   try {
//     const { width, height } = getDimensions();
//     return width > height ? "landscape" : "portrait";
//   } catch (error) {
//     console.warn("Error getting orientation:", error);
//     return "portrait"; // fallback
//   }
// };

// // Get current screen dimensions (updates with orientation)
// export const getCurrentDimensions = () => {
//   try {
//     return getDimensions();
//   } catch (error) {
//     console.warn("Error getting dimensions:", error);
//     return { width: 375, height: 667 }; // fallback
//   }
// };

// // Device type detection
// export const isTablet = () => {
//   try {
//     const { width, height } = getDimensions();
//     const pixelDensity = PixelRatio.get();
//     const adjustedWidth = width * pixelDensity;
//     const adjustedHeight = height * pixelDensity;

//     if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
//       return true;
//     } else {
//       return (
//         pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
//       );
//     }
//   } catch (error) {
//     console.warn("Error detecting tablet:", error);
//     return false; // fallback
//   }
// };

// // Device size categories with orientation awareness
// export const getDeviceSize = (orientation = null) => {
//   const currentOrientation = orientation || getOrientation();
//   const { width } = getCurrentDimensions();

//   if (isTablet()) return "tablet";

//   // Adjust size categories based on orientation
//   if (currentOrientation === "landscape") {
//     // In landscape, treat devices as "larger" for better grid layouts
//     if (width < 667) return "medium"; // iPhone SE landscape
//     if (width >= 667 && width < 896) return "large"; // iPhone 8, X landscape
//     return "xlarge"; // iPhone Plus, Max landscape
//   } else {
//     // Portrait mode (original logic)
//     if (width < 375) return "small"; // iPhone SE, older phones
//     if (width >= 375 && width < 414) return "medium"; // iPhone 8, X
//     return "large"; // iPhone Plus, Max, large Android phones
//   }
// };

// // Screen dimensions with orientation support
// export const getScreenData = () => {
//   try {
//     const dimensions = getCurrentDimensions();
//     const orientation = getOrientation();
//     return {
//       width: dimensions.width,
//       height: dimensions.height,
//       orientation,
//       deviceSize: getDeviceSize(orientation),
//       isTablet: isTablet(),
//       isSmallDevice: dimensions.width < 375,
//       isLandscape: orientation === "landscape",
//       isPortrait: orientation === "portrait",
//       isIOS: Platform.OS === "ios",
//       isAndroid: Platform.OS === "android",
//     };
//   } catch (error) {
//     console.warn("Error getting screen data:", error);
//     return {
//       width: 375,
//       height: 667,
//       orientation: "portrait",
//       deviceSize: "medium",
//       isTablet: false,
//       isSmallDevice: false,
//       isLandscape: false,
//       isPortrait: true,
//       isIOS: Platform.OS === "ios",
//       isAndroid: Platform.OS === "android",
//     };
//   }
// };

// // Legacy support - will be dynamic now
// export const screenData = getScreenData();

// // Responsive width function
// export const responsiveWidth = (percentage) => wp(percentage);

// // Responsive height function
// export const responsiveHeight = (percentage) => hp(percentage);

// // Scale function for consistent sizing across devices
// export const scaleSize = (size) => {
//   const { uiScale } = computeCentralScales();
//   return Math.round(size * uiScale);
// };

// // Vertical scale for heights, margins, paddings
// export const scaleVertical = (size) => {
//   const { vScale } = computeCentralScales();
//   return Math.round(size * vScale);
// };

// // Moderate scale for fonts (controlled scaling)
// export const scaleFont = (size, factor = 1) => {
//   const { uiScale } = computeCentralScales();
//   // Apply uiScale with optional moderation factor
//   const scaled = size * uiScale * factor;
//   return Math.round(scaled);
// };

// // Dynamic font scaling based on device accessibility settings
// export const getAccessibleFontSize = (baseSize, options = {}) => {
//   const {
//     maxScale = MAX_FONT_SCALE,
//     minScale = MIN_FONT_SCALE,
//     useUiScale = false,
//   } = options;
//   const { fontScale, uiScale } = computeCentralScales();

//   // Apply bounded accessibility font scale
//   const boundedFontScale = Math.max(minScale, Math.min(maxScale, fontScale));
//   let result = baseSize * boundedFontScale;

//   // Optionally apply UI scaling for consistency with other elements
//   if (useUiScale) {
//     result = result * uiScale;
//     // Prevent extreme scaling
//     const absoluteMax = MAX_UI_SCALE * MAX_FONT_SCALE;
//     const absoluteMin = MIN_UI_SCALE * MIN_FONT_SCALE;
//     result = Math.max(
//       absoluteMin * baseSize,
//       Math.min(absoluteMax * baseSize, result)
//     );
//   }

//   return Math.round(result);
// };

// // Responsive spacing system - Ultra compact
// export const spacing = {
//   xs: scaleSize(2), // Further reduced from 3
//   sm: scaleSize(4), // Further reduced from 6
//   md: scaleSize(8), // Further reduced from 12
//   lg: scaleSize(12), // Further reduced from 18
//   xl: scaleSize(16), // Further reduced from 24
//   xxl: scaleSize(24), // Further reduced from 36
// };

// // Responsive padding/margin based on device size and orientation
// export const getResponsiveSpacing = (base, orientation = null) => {
//   const currentOrientation = orientation || getOrientation();
//   const deviceSize = getDeviceSize(currentOrientation);
//   const { uiScale } = computeCentralScales();

//   let multiplier;
//   switch (deviceSize) {
//     case "small":
//       multiplier = 0.8;
//       break;
//     case "medium":
//       multiplier = 1;
//       break;
//     case "large":
//       multiplier = 1.1;
//       break;
//     case "xlarge":
//       multiplier = 1.2; // New size category for landscape
//       break;
//     case "tablet":
//       multiplier = 1.3;
//       break;
//     default:
//       multiplier = 1;
//       break;
//   }

//   // Adjust for orientation
//   if (currentOrientation === "landscape") {
//     multiplier *= 1.1; // Slightly increase spacing in landscape
//   }

//   // Apply central scaling with multiplier
//   const result = base * uiScale * multiplier;

//   // Prevent extreme scaling
//   const maxResult = base * MAX_UI_SCALE * 1.3;
//   const minResult = base * MIN_UI_SCALE * 0.8;

//   return Math.round(Math.max(minResult, Math.min(maxResult, result)));
// };

// // Typography system with accessibility
// export const typography = {
//   // Headers
//   h1: {
//     fontSize: getAccessibleFontSize(28),
//     fontWeight: "bold",
//     lineHeight: getAccessibleFontSize(34),
//   },
//   h2: {
//     fontSize: getAccessibleFontSize(24),
//     fontWeight: "bold",
//     lineHeight: getAccessibleFontSize(30),
//   },
//   h3: {
//     fontSize: getAccessibleFontSize(20),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(26),
//   },
//   h4: {
//     fontSize: getAccessibleFontSize(18),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(24),
//   },
//   h5: {
//     fontSize: getAccessibleFontSize(16),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(22),
//   },
//   h6: {
//     fontSize: getAccessibleFontSize(14),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(20),
//   },

//   // Body text
//   body: {
//     fontSize: getAccessibleFontSize(16),
//     lineHeight: getAccessibleFontSize(22),
//   },
//   bodySmall: {
//     fontSize: getAccessibleFontSize(14),
//     lineHeight: getAccessibleFontSize(20),
//   },
//   bodyCompact: {
//     fontSize: getAccessibleFontSize(12), // New ultra-compact variant for cards
//     lineHeight: getAccessibleFontSize(16),
//     fontWeight: "600",
//   },

//   // Captions
//   caption: {
//     fontSize: getAccessibleFontSize(12),
//     lineHeight: getAccessibleFontSize(16),
//   },
//   captionMedium: {
//     fontSize: getAccessibleFontSize(11), // New compact variant
//     lineHeight: getAccessibleFontSize(15),
//   },
//   captionSmall: {
//     fontSize: getAccessibleFontSize(10), // New compact variant
//     lineHeight: getAccessibleFontSize(14),
//   },

//   // Buttons
//   button: {
//     fontSize: getAccessibleFontSize(16),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(20),
//   },
//   buttonSmall: {
//     fontSize: getAccessibleFontSize(14),
//     fontWeight: "600",
//     lineHeight: getAccessibleFontSize(18),
//   },
// };

// // Responsive component dimensions with orientation support
// export const getComponentSizes = (orientation = null) => {
//   const currentOrientation = orientation || getOrientation();
//   const isLandscape = currentOrientation === "landscape";

//   return {
//     // Button sizes
//     button: {
//       small: {
//         height: scaleVertical(32),
//         paddingHorizontal: scaleSize(12),
//         paddingVertical: scaleVertical(6),
//       },
//       medium: {
//         height: scaleVertical(38),
//         paddingHorizontal: scaleSize(16),
//         paddingVertical: scaleVertical(10),
//       },
//       large: {
//         height: scaleVertical(44),
//         paddingHorizontal: scaleSize(20),
//         paddingVertical: scaleVertical(12),
//       },
//     },

//     // Input sizes
//     input: {
//       height: scaleVertical(42),
//       paddingHorizontal: scaleSize(14),
//       paddingVertical: scaleVertical(10),
//     },

//     // Card sizes
//     card: {
//       borderRadius: scaleSize(6),
//       padding: scaleSize(8),
//       margin: scaleSize(3),
//     },

//     // Product card dimensions - Orientation aware
//     productCard: {
//       width: isLandscape
//         ? Math.max(scaleSize(110), responsiveWidth(22)) // Smaller in landscape for more columns
//         : Math.max(scaleSize(120), responsiveWidth(28)), // Original size in portrait
//       minHeight: isLandscape
//         ? scaleVertical(140) // Shorter in landscape
//         : scaleVertical(160), // Original height in portrait
//     },
//   };
// };

// // Safe area helpers
// export const getSafeAreaPadding = () => {
//   if (Platform.OS === "ios") {
//     try {
//       const { height } = getCurrentDimensions();
//       // iOS devices with notches/Dynamic Island
//       if (height >= 812) {
//         return {
//           paddingTop: Math.round(scaleVertical(44)),
//           paddingBottom: 0, // Removed bottom padding completely
//         };
//       }
//       // Older iOS devices
//       return {
//         paddingTop: Math.round(scaleVertical(20)),
//         paddingBottom: 0,
//       };
//     } catch (error) {
//       console.warn("Error in getSafeAreaPadding:", error);
//       return {
//         paddingTop: Math.round(scaleVertical(20)),
//         paddingBottom: 0,
//       };
//     }
//   }

//   // Android - let SafeAreaView handle it
//   return {
//     paddingTop: 0,
//     paddingBottom: 0,
//   };
// };

// // Responsive icon sizes
// export const iconSizes = {
//   xs: scaleSize(12),
//   sm: scaleSize(16),
//   md: scaleSize(20),
//   lg: scaleSize(24),
//   xl: scaleSize(28),
//   xxl: scaleSize(32),
// };

// // Breakpoints for responsive design
// export const breakpoints = {
//   small: 375,
//   medium: 414,
//   large: 768,
//   xlarge: 1024,
// };

// // Responsive utility function with orientation support
// export const responsive = (styles, orientation = null) => {
//   const currentOrientation = orientation || getOrientation();
//   const deviceSize = getDeviceSize(currentOrientation);
//   const screenData = getScreenData();

//   if (typeof styles === "function") {
//     return styles({
//       deviceSize,
//       orientation: currentOrientation,
//       ...screenData,
//     });
//   }

//   // Check for orientation-specific styles first
//   if (styles[currentOrientation]) {
//     const orientationStyles = styles[currentOrientation];
//     if (orientationStyles[deviceSize]) {
//       return {
//         ...styles.default,
//         ...orientationStyles.default,
//         ...orientationStyles[deviceSize],
//       };
//     }
//     return { ...styles.default, ...orientationStyles.default };
//   }

//   // Fallback to device size styles
//   if (styles[deviceSize]) {
//     return { ...styles.default, ...styles[deviceSize] };
//   }

//   return styles.default || styles;
// };

// // Layout helpers
// export const layout = {
//   // Flex utilities
//   flex: {
//     flex: 1,
//   },
//   flexRow: {
//     flexDirection: "row",
//   },
//   flexColumn: {
//     flexDirection: "column",
//   },
//   center: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   centerHorizontal: {
//     alignItems: "center",
//   },
//   centerVertical: {
//     justifyContent: "center",
//   },
//   spaceBetween: {
//     justifyContent: "space-between",
//   },
//   spaceAround: {
//     justifyContent: "space-around",
//   },
//   spaceEvenly: {
//     justifyContent: "space-evenly",
//   },

//   // Container with responsive padding
//   container: {
//     flex: 1,
//     paddingHorizontal: getResponsiveSpacing(spacing.md),
//   },

//   // Section spacing - More compact
//   section: {
//     marginBottom: scaleVertical(16), // Reduced from 24
//   },
// };

// // Grid system for layout
// export const grid = {
//   // Two columns
//   col2: {
//     width: `${(100 - 2) / 2}%`,
//     marginRight: "2%",
//   },
//   col2Last: {
//     width: `${(100 - 2) / 2}%`,
//   },

//   // Three columns
//   col3: {
//     width: `${(100 - 4) / 3}%`,
//     marginRight: "2%",
//   },
//   col3Last: {
//     width: `${(100 - 4) / 3}%`,
//   },

//   // Four columns (tablets)
//   col4: {
//     width: `${(100 - 6) / 4}%`,
//     marginRight: "2%",
//   },
//   col4Last: {
//     width: `${(100 - 6) / 4}%`,
//   },
// };

// // Device-specific adjustments
// export const deviceAdjustments = {
//   // Minimum touch target size (accessibility)
//   minTouchTarget: Math.max(44, scaleSize(44)),

//   // Platform-specific shadow
//   shadow: Platform.select({
//     ios: {
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//     },
//     android: {
//       elevation: 4,
//     },
//   }),

//   // Platform-specific border radius
//   borderRadius: Platform.select({
//     ios: scaleSize(12),
//     android: scaleSize(8),
//   }),
// };

// export default {
//   // Core functions
//   getOrientation,
//   getCurrentDimensions,
//   responsiveWidth,
//   responsiveHeight,
//   scaleSize,
//   scaleVertical,
//   scaleFont,
//   getAccessibleFontSize,

//   // Spacing and layout
//   spacing,
//   getResponsiveSpacing,
//   typography,
//   getComponentSizes,
//   getSafeAreaPadding,
//   iconSizes,
//   breakpoints,
//   responsive,
//   layout,
//   grid,
//   deviceAdjustments,

//   // Device detection
//   isTablet,
//   getDeviceSize,
//   getScreenData,

//   // Legacy support
//   screenData,
// };

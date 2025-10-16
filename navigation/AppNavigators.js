import { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../store/auth-context";
import { useI18n } from "../store/i18n-context";
import { useSafeArea } from "../components/UI/SafeAreaWrapper";
import { Colors } from "../constants/styles";
import { useDeviceOrientation } from "../hooks/useResponsive";
import {
  scaleVertical,
  iconSizes,
  typography,
  getDeviceSize,
  isTablet,
  getOrientation,
  responsiveWidth,
  scaleSize,
} from "../constants/responsive";
// import { Dimensions, PixelRatio } from "react-native";

// Screen imports
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import UserScreen from "../screens/UserScreen";
import CartScreen from "../screens/CartScreen";
import BillingScreen from "../screens/BillingScreen";
import MenuScreen from "../screens/MenuScreen";
import AllProducts from "../screens/AllProducts";
import SearchResultsScreen from "../screens/SearchResultsScreen";
import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailsScreen from "../components/UserComponents/Orders/OrderDetailsScreen";
import SavedItemsScreen from "../screens/SavedItemsScreen";
import EmailVerificationScreen from "../screens/EmailVerificationScreen";
import EmailPasswordReset from "../components/Auth/providers/EmailAuth/EmailPasswordReset";
import UserSettingsOutput from "../components/UserComponents/Settings/UserSettingsOutput";

// Return screens imports
import ReturnRequestScreen from "../components/Returns/ReturnRequestScreen";
import ReturnsListScreen from "../components/Returns/ReturnsListScreen";
import ReturnSuccessScreen from "../components/Returns/ReturnSuccessScreen";
import ReturnTrackingScreen from "../components/Returns/ReturnTrackingScreen";

// Component imports
import IconButton from "../components/UI/IconButton";
import SearchBarHeader from "../components/SearchComponents/SearchBarHeader";
import CartIconWithBadge from "../components/UI/CartIconWithBadge";

const HomeStack = createNativeStackNavigator();
const AllProductsStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

/**
 * Home Stack Navigator
 *
 * Handles navigation between the home screen and search results.
 * Includes dynamic header height based on safe area insets and orientation.
 */
export function HomeStackNavigator() {
  const insets = useSafeArea();
  const deviceSize = getDeviceSize();
  const { orientation } = useDeviceOrientation();

  // Orientation-aware header configuration
  const getHeaderHeight = () => {
    if (orientation === "landscape" && !isTablet) {
      // Compact header for phones in landscape
      return Math.round(scaleVertical(60)) + Math.round(insets.top);
    }
    const baseHeaderHeight = deviceSize === "tablet" ? 100 : 90;
    return Math.round(scaleVertical(baseHeaderHeight)) + Math.round(insets.top);
  };

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary300,
          height: getHeaderHeight(),
        },
        headerTintColor: Colors.accent700,
        headerSafeAreaInsets: { top: 0 }, // We handle this manually
        headerTitleStyle: {
          ...typography.h3,
          fontSize:
            orientation === "landscape" && !isTablet
              ? typography.bodySmall.fontSize
              : typography.h3.fontSize,
        },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerTitle: () => <SearchBarHeader />,
        }}
      />
      <HomeStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          headerBackTitle: "Back",
        }}
      />
      <HomeStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          headerTitle: () => <SearchBarHeader />,
        }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * All Products Stack Navigator
 *
 * Handles navigation between product browsing and search results.
 */
// export function AllProductsStackNavigator() {
//   const { t } = useI18n();
//   const insets = useSafeArea();
//   const deviceSize = getDeviceSize();
//   const { orientation } = useDeviceOrientation();

//   // Orientation-aware header configuration
//   const getHeaderHeight = () => {
//     if (orientation === "landscape" && !isTablet) {
//       // Compact header for phones in landscape
//       return Math.round(scaleVertical(60)) + Math.round(insets.top);
//     }
//     const baseHeaderHeight = deviceSize === "tablet" ? 100 : 90;
//     return Math.round(scaleVertical(baseHeaderHeight)) + Math.round(insets.top);
//   };

//   return (
//     <AllProductsStack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: Colors.primary300,
//           height: getHeaderHeight(),
//         },
//         headerTintColor: Colors.accent700,
//         headerSafeAreaInsets: { top: 0 }, // We handle this manually
//         headerTitleStyle: {
//           ...typography.h3,
//           fontSize:
//             orientation === "landscape" && !isTablet
//               ? typography.bodySmall.fontSize
//               : typography.h3.fontSize,
//         },
//       }}
//     >
//       <AllProductsStack.Screen
//         name="AllProductsMain"
//         component={AllProducts}
//         options={{
//           title: t("navigation.browseProducts"),
//           headerTitle: () => <SearchBarHeader />,
//         }}
//       />
//       <AllProductsStack.Screen
//         name="SearchResults"
//         component={SearchResultsScreen}
//         options={{
//           headerTitle: () => <SearchBarHeader />,
//         }}
//       />
//     </AllProductsStack.Navigator>
//   );
// }

/**
 * Cart Stack Navigator
 *
 * Handles navigation between cart screen and billing screen.
 */
export function CartStackNavigator() {
  const { t } = useI18n();
  const insets = useSafeArea();
  const deviceSize = getDeviceSize();
  const { orientation } = useDeviceOrientation();

  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary300,
          height:
            scaleVertical(deviceSize === "tablet" ? 100 : 90) + insets.top,
        },
        headerTintColor: Colors.accent700,
        headerSafeAreaInsets: { top: 0 },
        headerTitleStyle: {
          ...typography.h3,
          fontSize:
            orientation === "landscape" && !isTablet
              ? typography.bodySmall.fontSize
              : typography.h3.fontSize,
        },
      }}
    >
      <CartStack.Screen
        name="CartMain"
        component={CartScreen}
        options={{
          title: t("navigation.yourCart"),
        }}
      />
      <CartStack.Screen
        name="BillingScreen"
        component={BillingScreen}
        options={{
          title: t("navigation.reviewAndPay"),
        }}
      />
    </CartStack.Navigator>
  );
}

/**
 * User Stack Navigator
 *
 * Handles navigation for user-related screens including orders.
 * Provides a full screen experience for order management with orientation support.
 */
export function UserStackNavigator() {
  const authCtx = useContext(AuthContext);
  const { t } = useI18n();
  const insets = useSafeArea();
  const { orientation } = useDeviceOrientation();

  // // Don't render navigator until auth state is known to avoid flicker.
  // // Replace `isInitializing` with whatever flag your auth context provides.
  // if (authCtx.isInitializing) {
  //   return null; // or return a <LoadingSpinner /> component
  // }

  // // Decide initial route based on auth state.
  // // Replace the condition below with your app's real "needs verification" flag.
  // const initialRouteName =
  //   authCtx.needsVerification === true ? "EmailVerification" : "UserMain";

  // Orientation-aware header configuration
  const getHeaderHeight = () => {
    if (orientation === "landscape" && !isTablet) {
      // Compact header for phones in landscape
      return Math.round(60) + Math.round(insets.top);
    }
    return Math.round(90) + Math.round(insets.top);
  };

  return (
    <UserStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary300,
          height: getHeaderHeight(),
        },
        headerTintColor: Colors.accent700,
        headerSafeAreaInsets: { top: 0 }, // We handle this manually
        headerTitleStyle: {
          fontSize:
            orientation === "landscape" && !isTablet
              ? typography.bodySmall.fontSize
              : undefined,
        },
      }}
      // initialRouteName="EmailVerification"
      // initialRouteName={initialRouteName}
    >
      <UserStack.Screen
        name="UserMain"
        component={UserScreen}
        options={{
          title: t("navigation.user"),
          headerRight: ({ tintColor }) =>
            authCtx.isAuthenticated ? (
              <IconButton
                icon="exit"
                color={tintColor}
                size={24}
                onPress={authCtx.logout}
              />
            ) : null,
        }}
      />
      <UserStack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={{
          title: t("navigation.myOrders"),
        }}
      />
      <UserStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
        options={{
          title: t("navigation.orderDetails"),
        }}
      />
      <UserStack.Screen
        name="SavedItemsScreen"
        component={SavedItemsScreen}
        options={{
          title: t("navigation.savedItems"),
          headerShown: false,
        }}
      />
      <UserStack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{
          title: t("navigation.verifyEmail"),
          headerShown: false,
        }}
      />
      <UserStack.Screen
        name="EmailPasswordReset"
        component={EmailPasswordReset}
        options={{
          title: t("navigation.resetPassword"),
          headerShown: false,
        }}
      />
      <UserStack.Screen
        name="UserSettingsOutput"
        component={UserSettingsOutput}
        options={{
          title: t("navigation.settings"),
        }}
      />
      <UserStack.Screen
        name="ReturnRequestScreen"
        component={ReturnRequestScreen}
        options={{
          title: t("navigation.returnRequest"),
          headerShown: true,
        }}
      />
      <UserStack.Screen
        name="ReturnsListScreen"
        component={ReturnsListScreen}
        options={{
          title: t("navigation.myReturns"),
          headerShown: true,
        }}
      />
      <UserStack.Screen
        name="ReturnSuccessScreen"
        component={ReturnSuccessScreen}
        options={{
          title: t("navigation.returnSubmitted"),
          headerShown: false,
        }}
      />
      <UserStack.Screen
        name="ReturnTrackingScreen"
        component={ReturnTrackingScreen}
        options={{
          title: t("navigation.trackReturn"),
          headerShown: true,
        }}
      />
    </UserStack.Navigator>
  );
}

/**
 * Bottom Tabs Navigator
 *
 * Main app navigation with bottom tab bar.
 * Handles safe area insets for both header and tab bar with orientation support.
 */
export function BottomTabsOverview() {
  const authCtx = useContext(AuthContext);
  const { t } = useI18n();
  const insets = useSafeArea();
  const deviceSize = getDeviceSize();
  const { orientation } = useDeviceOrientation();

  // Responsive icon size calculation using responsive.js helpers     // Orientation-aware configuration
  const getTabBarConfig = () => {
    // Use responsiveWidth and scaleSize for icon sizing
    let baseIconSize;
    if (isTablet()) {
      // Tablets: slightly larger but capped
      baseIconSize = Math.min(scaleSize(36), responsiveWidth(3.85));
    } else if (orientation === "landscape") {
      // Landscape phones: more compact
      baseIconSize = Math.max(scaleSize(18), responsiveWidth(5));
    } else {
      // Portrait phones: default
      baseIconSize = Math.max(scaleSize(26), responsiveWidth(6));
    }

    if (orientation === "landscape" && !isTablet()) {
      return {
        baseHeaderHeight: 70,
        baseTabHeight: 35,
        paddingBottom: Math.max(insets.bottom, 2),
        iconSize: {
          focused: baseIconSize + 4,
          unfocused: Math.max(16, baseIconSize - 2),
        },
        labelStyle: {
          ...typography.caption,
          fontSize: typography.captionSmall.fontSize,
          fontWeight: "600",
        },
      };
    }

    return {
      baseHeaderHeight: deviceSize === "tablet" ? 100 : 90,
      baseTabHeight: deviceSize === "tablet" ? 45 : 45,
      paddingBottom: Math.max(insets.bottom, 4),
      iconSize: {
        focused: baseIconSize,
        unfocused: Math.max(16, baseIconSize - 2),
      },
      labelStyle: {
        ...typography.caption,
        fontWeight: "600",
        flexWrap: "wrap", // Allow wrapping if needed
        textAlign: "center",
      },
    };
  };

  // // Manual settings, works perfectly fine,
  // const getTabBarConfig = () => {
  //   const { width, height } = Dimensions.get("window");
  //   const fontScale = PixelRatio.getFontScale();
  //   const isLargeScreen = width >= 768; // iPad or larger

  //   // Calculate icon size dynamically
  //   const baseIconSize = isLargeScreen
  //     ? Math.max(36, Math.min(32, Math.round(width / 32 / fontScale)))
  //     : Math.max(24, Math.min(28, Math.round(width / 20 / fontScale)));

  //   if (orientation === "landscape" && !isTablet) {
  //     return {
  //       baseHeaderHeight: 70,
  //       baseTabHeight: 35,
  //       paddingBottom: Math.max(insets.bottom, 2),
  //       iconSize: {
  //         focused: baseIconSize,
  //         unfocused: Math.max(18, baseIconSize - 4),
  //       },
  //       labelStyle: {
  //         ...typography.caption,
  //         fontSize: typography.captionSmall.fontSize,
  //         fontWeight: "600",
  //       },
  //     };
  //   }

  //   return {
  //     baseHeaderHeight: deviceSize === "tablet" ? 100 : 90,
  //     baseTabHeight: deviceSize === "tablet" ? 50 : 45,
  //     paddingBottom: Math.max(insets.bottom, 4),
  //     iconSize: {
  //       focused: baseIconSize,
  //       unfocused: Math.max(18, baseIconSize - 4),
  //     },
  //     labelStyle: {
  //       ...typography.caption,
  //       fontWeight: "600",
  //     },
  //   };
  // };

  const tabConfig = getTabBarConfig();

  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary300,
          height: scaleVertical(tabConfig.baseHeaderHeight) + insets.top,
        },
        headerTintColor: Colors.accent700,
        headerSafeAreaInsets: { top: 0 }, // We handle this manually
        headerTitleStyle: {
          ...typography.h3,
          fontSize:
            orientation === "landscape" && !isTablet
              ? typography.bodySmall.fontSize
              : typography.h3.fontSize,
        },
        tabBarStyle: {
          backgroundColor: Colors.primary300,
          paddingBottom: tabConfig.paddingBottom,
          // Optimize height calculation for better space utilization
          height: tabConfig.baseTabHeight + tabConfig.paddingBottom,
        },
        tabBarActiveTintColor: Colors.accent500,
        tabBarInactiveTintColor: "black",
        tabBarLabelStyle: tabConfig.labelStyle,
      }}
    >
      <BottomTabs.Screen
        name="HomeScreen"
        component={HomeStackNavigator}
        options={{
          title: t("navigation.home"),
          tabBarLabel: t("navigation.home"),
          tabBarIcon: ({ color, focused }) => {
            const tabConfig = getTabBarConfig();
            return (
              <Ionicons
                name="home"
                size={
                  focused
                    ? tabConfig.iconSize.focused
                    : tabConfig.iconSize.unfocused
                }
                color={color}
              />
            );
          },
          headerShown: false,
        }}
      />
      {/* <BottomTabs.Screen
        name="AllProductsScreen"
        component={AllProductsStackNavigator}
        options={{
          title: t("navigation.browseProducts"),
          tabBarLabel: t("navigation.products"),
          tabBarIcon: ({ color, focused }) => {
            const tabConfig = getTabBarConfig();
            return (
              <Ionicons
                name="grid"
                size={
                  focused
                    ? tabConfig.iconSize.focused
                    : tabConfig.iconSize.unfocused
                }
                color={color}
              />
            );
          },
          headerShown: false,
        }}
      /> */}
      <BottomTabs.Screen
        name="CartScreen"
        component={CartStackNavigator}
        options={{
          title: t("navigation.yourCart"),
          tabBarLabel: t("navigation.cart"),
          tabBarIcon: ({ color, focused }) => {
            const tabConfig = getTabBarConfig();
            return (
              <CartIconWithBadge
                color={color}
                size={
                  focused
                    ? tabConfig.iconSize.focused
                    : tabConfig.iconSize.unfocused
                }
              />
            );
          },
          headerShown: false,
        }}
      />
      <BottomTabs.Screen
        name="UserScreen"
        component={UserStackNavigator}
        options={{
          title: t("navigation.user"),
          tabBarLabel: t("navigation.user"),
          tabBarIcon: ({ color, focused }) => {
            const tabConfig = getTabBarConfig();
            return (
              <Ionicons
                name="person"
                size={
                  focused
                    ? tabConfig.iconSize.focused
                    : tabConfig.iconSize.unfocused
                }
                color={color}
              />
            );
          },
          headerShown: false,
        }}
      />
      <BottomTabs.Screen
        name="MenuScreen"
        component={MenuScreen}
        options={{
          title: t("common.menu"),
          tabBarLabel: t("common.menu"),
          tabBarIcon: ({ color, focused }) => {
            const tabConfig = getTabBarConfig();
            return (
              <Ionicons
                name="menu"
                size={
                  focused
                    ? tabConfig.iconSize.focused
                    : tabConfig.iconSize.unfocused
                }
                color={color}
              />
            );
          },
        }}
      />
    </BottomTabs.Navigator>
  );
}

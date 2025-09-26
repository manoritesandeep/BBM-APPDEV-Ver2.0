// IMPORTANT: This must be the first import to avoid crashes
import "react-native-get-random-values";

// Initialize i18n before other imports
import "./localization/i18n";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { getFirebaseDB } from "./util/firebaseConfig";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { View, Platform, StatusBar as RNStatusBar } from "react-native";

// Context and state management imports
import ProductsContextProvider from "./store/products-context";
import { CartContextProvider } from "./store/cart-context";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import { UserContextProvider } from "./store/user-context";
import { UserContext } from "./store/user-context";
import { AddressContextProvider } from "./store/address-context";
import { SearchContextProvider } from "./store/search-context";
import BBMBucksContextProvider from "./store/bbm-bucks-context";
import SavedItemsContextProvider from "./store/saved-items-context";
import { ReturnsContextProvider } from "./store/returns-context";
import { I18nProvider } from "./store/i18n-context";
import { ThemeProvider } from "./store/theme-context";

// Component imports
import ErrorBoundary from "./components/UI/ErrorBoundary";
import LoadingOverlay from "./components/UI/LoadingOverlay";
import { SafeAreaProviderWrapper } from "./components/UI/SafeAreaWrapper";
import { ToastProvider } from "./components/UI/ToastProvider";

// Navigation imports
import { BottomTabsOverview } from "./navigation/AppNavigators";
import { EmailVerificationChecker } from "./hooks/useEmailVerification";

// Constants
import { Colors } from "./constants/styles";

// Initialize responsive system
import "./constants/responsive";

// Initialize phone auth optimization for better UX
import phoneAuthOptimizer from "./util/firebasePhoneAuthOptimizer";

const Stack = createNativeStackNavigator();

/**
 * Root Navigation Component
 *
 * Provides the root level navigation structure for the entire app.
 * Currently wraps the BottomTabsOverview but can be extended for additional
 * navigation layers like modals or authentication flows.
 */
function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabsOverview" component={BottomTabsOverview} />
    </Stack.Navigator>
  );
}

/**
 * Root Component
 *
 * Handles app initialization including:
 * - Authentication state restoration from AsyncStorage
 * - User profile fetching from Firestore
 * - Splash screen management
 * - Error handling during initialization
 *
 * This component manages the initial loading state and provides
 * the main navigation container once initialization is complete.
 */
function Root() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const [initError, setInitError] = useState(null);
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    async function fetchToken() {
      try {
        console.log("🔄 Checking for stored authentication...");

        // Initialize phone auth optimization early
        try {
          await phoneAuthOptimizer.configure();
          console.log("✅ Phone auth optimization initialized");
        } catch (error) {
          console.warn("⚠️ Phone auth optimization failed:", error.message);
        }

        const storedToken = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedProvider = await AsyncStorage.getItem("authProvider");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

        if (storedToken && storedUserId) {
          authCtx.authenticate(
            storedToken,
            storedUserId,
            storedProvider || "email",
            storedRefreshToken
          );

          try {
            // Get database instance safely
            const db = await getFirebaseDB();
            if (db) {
              const userDoc = await getDoc(doc(db, "users", storedUserId));
              if (userDoc.exists()) {
                userCtx.setUser(userDoc.data());
              }
            } else {
              console.warn(
                "📊 Database not available, skipping user data fetch"
              );
            }
          } catch (firebaseError) {
            console.warn("❌ Failed to fetch user data:", firebaseError);
            // Continue without user data rather than crash
          }
        }
      } catch (error) {
        console.error("🚨 Auth initialization error:", error);
        setInitError(error.message);
      } finally {
        // Add a small delay to ensure smooth transition
        setTimeout(async () => {
          setIsTryingLogin(false);
          await SplashScreen.hideAsync().catch((hideError) => {
            console.warn("⚠️ Error hiding splash screen:", hideError);
          });
        }, 300);
      }
    }

    fetchToken();
  }, []); // Empty dependency array - this should only run once on mount

  // Show loading overlay during initialization instead of blank screen
  if (isTryingLogin) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.primary300 }}>
        <LoadingOverlay
          message="Loading Build Bharat Mart..."
          color={Colors.accent700}
          backgroundColor={Colors.primary300}
        />
      </View>
    );
  }

  // Log initialization errors but continue with app functionality
  if (initError) {
    console.error("App initialization failed:", initError);
    // Still show the navigation to allow app to function
  }

  return (
    <NavigationContainer>
      <RootNavigation />
    </NavigationContainer>
  );
}

/**
 * Main App Component
 *
 * The root component that sets up all context providers and the navigation structure.
 * This includes:
 * - Status bar configuration
 * - Safe area provider for handling device notches/dynamic islands
 * - Error boundary for crash protection
 * - All context providers for state management
 * - Root navigation component
 *
 * The providers are organized in a logical hierarchy to ensure proper
 * context availability throughout the app.
 */
export default function App() {
  // Get status bar height for iOS/Android
  const statusBarHeight = 0;
  // Platform.OS === "android" ? RNStatusBar.currentHeight : 2;
  return (
    <>
      {/* Render a view under the status bar for background color */}
      <View
        style={{ height: statusBarHeight, backgroundColor: Colors.primary300 }}
      />
      <StatusBar style="dark" />
      <SafeAreaProviderWrapper>
        <ErrorBoundary>
          <ToastProvider>
            <ThemeProvider>
              <I18nProvider>
                <AuthContextProvider>
                  <BBMBucksContextProvider>
                    <UserContextProvider>
                      <AddressContextProvider>
                        <ProductsContextProvider>
                          <CartContextProvider>
                            <SavedItemsContextProvider>
                              <ReturnsContextProvider>
                                <SearchContextProvider>
                                  <EmailVerificationChecker />
                                  <Root />
                                </SearchContextProvider>
                              </ReturnsContextProvider>
                            </SavedItemsContextProvider>
                          </CartContextProvider>
                        </ProductsContextProvider>
                      </AddressContextProvider>
                    </UserContextProvider>
                  </BBMBucksContextProvider>
                </AuthContextProvider>
              </I18nProvider>
            </ThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </SafeAreaProviderWrapper>
    </>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@BBM_THEME";

export const ThemeContext = createContext({
  theme: "light",
  changeTheme: () => {},
  colors: {},
  isDark: false,
  isSystemDefault: true,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Light theme colors
const lightTheme = {
  // Core Brand Colors
  primary50: "#FFF8E1",
  primary100: "#FFE082",
  primary300: "#FFCD00",
  primary500: "#F9C400",

  // Accent Colors
  accent500: "#C20F0F",
  accent700: "#8C0B0B",

  // Backgrounds
  background: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",

  // Text Colors
  text: "#000000",
  textSecondary: "#666666",
  textMuted: "#999999",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Borders and shadows
  border: "#E5E7EB",
  shadow: "rgba(0, 0, 0, 0.1)",
};

// Dark theme colors
const darkTheme = {
  // Core Brand Colors (adjusted for dark mode)
  primary50: "#1A1A00",
  primary100: "#333300",
  primary300: "#FFCD00",
  primary500: "#F9C400",

  // Accent Colors
  accent500: "#FF3B3B",
  accent700: "#CC0000",

  // Backgrounds
  background: "#0B111B",
  surface: "#1A1A1A",
  card: "#262626",

  // Text Colors
  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textMuted: "#999999",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#1f2937",
  gray100: "#374151",
  gray200: "#4b5563",
  gray300: "#6b7280",
  gray400: "#9ca3af",
  gray500: "#d1d5db",
  gray600: "#e5e7eb",
  gray700: "#f3f4f6",
  gray800: "#f9fafb",
  gray900: "#ffffff",

  // Status colors (adjusted for dark mode)
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",

  // Borders and shadows
  border: "#374151",
  shadow: "rgba(0, 0, 0, 0.3)",
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine actual theme based on system preference and user selection
  const getActualTheme = () => {
    if (theme === "system") {
      return Appearance.getColorScheme() || "light";
    }
    return theme;
  };

  const actualTheme = getActualTheme();
  const isDark = actualTheme === "dark";
  const colors = isDark ? darkTheme : lightTheme;

  // Initialize theme on app start
  useEffect(() => {
    initializeTheme();
  }, []);

  // Listen to system theme changes when using system default
  useEffect(() => {
    if (theme === "system") {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        // This will trigger a re-render with the new system theme
      });

      return () => subscription?.remove();
    }
  }, [theme]);

  const initializeTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        // Default to system theme
        setTheme("system");
        await AsyncStorage.setItem(THEME_STORAGE_KEY, "system");
      }
    } catch (error) {
      console.error("Error initializing theme:", error);
      setTheme("system");
    } finally {
      setIsInitialized(true);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      if (!["light", "dark", "system"].includes(newTheme)) {
        throw new Error(`Invalid theme: ${newTheme}`);
      }

      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error changing theme:", error);
    }
  };

  const value = {
    theme,
    actualTheme,
    changeTheme,
    colors,
    isDark,
    isSystemDefault: theme === "system",
    isInitialized,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

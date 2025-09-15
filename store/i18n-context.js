import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { AppState } from "react-native";
import i18n from "../localization/i18n";

const LANGUAGE_STORAGE_KEY = "@BBM_LANGUAGE";

export const I18nContext = createContext({
  currentLanguage: "en",
  changeLanguage: () => {},
  t: () => "",
  isRTL: false,
  supportedLanguages: [],
  forceCheckDeviceLanguage: () => {},
  clearLanguageData: () => {}, // For testing
  renderKey: 0, // For forcing re-renders
});

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Add a render key to force re-renders

  const supportedLanguages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
  ];

  const isRTL = ["ar", "he", "fa"].includes(currentLanguage);

  // Initialize language on app start
  useEffect(() => {
    initializeLanguage();
  }, []);

  // Add a separate effect to handle language changes more aggressively
  useEffect(() => {
    if (!isInitialized) return;

    const handleLanguageChangeOnFocus = async () => {
      // console.log("🔄 App focus detected, forcing language check...");
      const deviceLocales = Localization.getLocales();
      const deviceLanguage = deviceLocales.find((locale) =>
        supportedLanguages.some((lang) => lang.code === locale.languageCode)
      );

      const detectedLanguage = deviceLanguage
        ? deviceLanguage.languageCode
        : "en";
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const isAutoDetected = await AsyncStorage.getItem(
        LANGUAGE_STORAGE_KEY + "_AUTO"
      );

      console.log(
        "🔍 Focus check - Device:",
        detectedLanguage,
        "Saved:",
        savedLanguage,
        "Auto:",
        isAutoDetected
      );

      // If current language differs from device language and it's auto-detected
      if (currentLanguage !== detectedLanguage && isAutoDetected === "true") {
        // console.log("🚀 Force updating language on focus");
        setCurrentLanguage(detectedLanguage);
        await i18n.changeLanguage(detectedLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);

        // Force complete re-render
        setRenderKey((prev) => prev + 1);
        setShouldRender(false);
        setTimeout(() => setShouldRender(true), 100);
      }
    };

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleLanguageChangeOnFocus();
      }
    });

    return () => subscription?.remove();
  }, [isInitialized, currentLanguage, renderKey]);

  // Listen for device locale changes and app state changes
  useEffect(() => {
    const checkDeviceLanguageChange = async () => {
      try {
        // console.log("🔍 Checking device language change...");

        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const isAutoDetected = await AsyncStorage.getItem(
          LANGUAGE_STORAGE_KEY + "_AUTO"
        );

        const deviceLocales = Localization.getLocales();
        // console.log("📱 Device locales:", deviceLocales);

        const primaryDeviceLanguage = deviceLocales[0]?.languageCode;
        // console.log("🌍 Primary device language:", primaryDeviceLanguage);
        // console.log("💾 Saved language:", savedLanguage);
        // console.log("🤖 Is auto-detected:", isAutoDetected);

        // Find the first supported language from device locales
        const deviceLanguage = deviceLocales.find((locale) =>
          supportedLanguages.some((lang) => lang.code === locale.languageCode)
        );

        const detectedLanguage = deviceLanguage
          ? deviceLanguage.languageCode
          : "en";

        // console.log("✅ Detected supported language:", detectedLanguage);

        // Always update if no saved language OR if current language was auto-detected and device language changed
        const shouldUpdate =
          !savedLanguage ||
          (isAutoDetected === "true" && savedLanguage !== detectedLanguage);

        // console.log("🔄 Should update language:", shouldUpdate);

        if (shouldUpdate) {
          // console.log(
          //   `🚀 Updating language from ${savedLanguage} to ${detectedLanguage}`
          // );
          await changeLanguageToDetected(detectedLanguage);
          // Force re-render
          setShouldRender(false);
          setTimeout(() => setShouldRender(true), 50);
          // console.log(
          //   `✅ Language updated successfully to: ${detectedLanguage}`
          // );
        } else {
          console.log("ℹ️ No language update needed");
        }
      } catch (error) {
        console.error("❌ Error checking device language change:", error);
      }
    };

    // Listen for app state changes (when app comes to foreground)
    const handleAppStateChange = (nextAppState) => {
      // console.log("📱 App state changed to:", nextAppState);
      if (nextAppState === "active") {
        // console.log("🔄 App became active, checking device language...");
        checkDeviceLanguageChange();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Check immediately on mount if initialized
    if (isInitialized) {
      checkDeviceLanguageChange();
    }

    return () => {
      subscription?.remove();
    };
  }, [isInitialized]); // Depend on isInitialized instead of currentLanguage

  const initializeLanguage = async () => {
    try {
      // console.log("🚀 Initializing language system...");

      // Get device locales first
      const deviceLocales = Localization.getLocales();
      // console.log("📱 Device locales on init:", deviceLocales);

      // Check if user has previously selected a language
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const isAutoDetected = await AsyncStorage.getItem(
        LANGUAGE_STORAGE_KEY + "_AUTO"
      );

      // console.log("💾 Saved language on init:", savedLanguage);
      // console.log("🤖 Is auto-detected on init:", isAutoDetected);

      // Find the best supported language from device
      const deviceLanguage = deviceLocales.find((locale) =>
        supportedLanguages.some((lang) => lang.code === locale.languageCode)
      );

      const detectedLanguage = deviceLanguage
        ? deviceLanguage.languageCode
        : "en";
      // console.log("✅ Detected supported language on init:", detectedLanguage);

      let languageToUse = "en"; // fallback

      if (
        savedLanguage &&
        supportedLanguages.some((lang) => lang.code === savedLanguage)
      ) {
        // If manually selected language exists, use it
        if (isAutoDetected === "false") {
          languageToUse = savedLanguage;
          console.log("👤 Using manually selected language:", languageToUse);
        } else {
          // If it was auto-detected, check if device language has changed
          if (savedLanguage === detectedLanguage) {
            languageToUse = savedLanguage;
            // console.log(
            //   "🤖 Using saved auto-detected language:",
            //   languageToUse
            // );
          } else {
            languageToUse = detectedLanguage;
            // console.log(
            //   "🔄 Device language changed, using new detected language:",
            //   languageToUse
            // );
          }
        }
      } else {
        // First time or invalid saved language - auto-detect
        languageToUse = detectedLanguage;
        // console.log(
        //   "🆕 First time or invalid saved language, auto-detecting:",
        //   languageToUse
        // );
      }

      // console.log("🎯 Final language to use:", languageToUse);

      // Apply the language
      setCurrentLanguage(languageToUse);
      await i18n.changeLanguage(languageToUse);

      // Save the language and mark as auto-detected if it came from device
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageToUse);

      if (!savedLanguage || isAutoDetected !== "false") {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY + "_AUTO", "true");
        console.log("🤖 Marked language as auto-detected");
      }

      // Force re-render to ensure UI updates
      setRenderKey((prev) => prev + 1);

      console.log(
        `✅ Language system initialized with: ${languageToUse} (render key: ${
          renderKey + 1
        })`
      );
    } catch (error) {
      console.error("❌ Error initializing language:", error);
      // Fallback to English
      setCurrentLanguage("en");
      await i18n.changeLanguage("en");
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY + "_AUTO", "true");
    } finally {
      setIsInitialized(true);
      setShouldRender(true);
      console.log("✅ Language initialization completed");
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      console.log(`👤 Manual language change requested: ${languageCode}`);

      if (!supportedLanguages.some((lang) => lang.code === languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      setCurrentLanguage(languageCode);
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      // Mark as manually selected (not auto-detected)
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY + "_AUTO", "false");

      // Force all components to re-render
      setRenderKey((prev) => prev + 1);

      // Force re-render to ensure UI updates
      setShouldRender(false);
      setTimeout(() => setShouldRender(true), 50);

      console.log(
        `✅ Language manually changed to: ${languageCode} (render key: ${
          renderKey + 1
        })`
      );
    } catch (error) {
      console.error("❌ Error changing language:", error);
    }
  };

  // Function to force check device language (useful for testing)
  const forceCheckDeviceLanguage = async () => {
    console.log("🔄 Force checking device language...");
    const deviceLocales = Localization.getLocales();
    console.log("📱 Current device locales:", deviceLocales);

    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const isAutoDetected = await AsyncStorage.getItem(
      LANGUAGE_STORAGE_KEY + "_AUTO"
    );

    // console.log("💾 Current saved language:", savedLanguage);
    // console.log("🤖 Is currently auto-detected:", isAutoDetected);

    if (isAutoDetected === "true") {
      const deviceLanguage = deviceLocales.find((locale) =>
        supportedLanguages.some((lang) => lang.code === locale.languageCode)
      );

      const detectedLanguage = deviceLanguage
        ? deviceLanguage.languageCode
        : "en";
      console.log("✅ Would detect language:", detectedLanguage);

      if (savedLanguage !== detectedLanguage) {
        await changeLanguageToDetected(detectedLanguage);
      }
    }
  };

  const changeLanguageToDetected = async (languageCode) => {
    setCurrentLanguage(languageCode);
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY + "_AUTO", "true");

    // Force all components to re-render
    setRenderKey((prev) => prev + 1);
    console.log(
      `🤖 Auto-changed language to: ${languageCode} (render key: ${
        renderKey + 1
      })`
    );
  };

  // Function to clear language data for testing
  const clearLanguageData = async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY + "_AUTO");
      console.log("🧹 Language data cleared");

      // Force re-render and re-initialize
      setShouldRender(false);
      setTimeout(async () => {
        await initializeLanguage();
      }, 100);
    } catch (error) {
      console.error("❌ Error clearing language data:", error);
    }
  };

  const t = (key, options = {}) => {
    return i18n.t(key, options);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
    supportedLanguages,
    isInitialized,
    forceCheckDeviceLanguage, // For debugging/testing
    clearLanguageData, // For testing
    renderKey, // Add render key to force re-renders
  };

  // Don't render children until language is properly initialized
  if (!shouldRender) {
    return null;
  }

  return (
    <I18nContext.Provider value={value} key={`i18n-${renderKey}`}>
      {children}
    </I18nContext.Provider>
  );
};

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import en from "./translations/en.json";
import hi from "./translations/hi.json";
import de from "./translations/de.json";
import fr from "./translations/fr.json";
import zh from "./translations/zh.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  de: { translation: de },
  fr: { translation: fr },
  zh: { translation: zh },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  defaultNS: "translation",
  ns: ["translation"],
  react: {
    useSuspense: false,
  },

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  react: {
    useSuspense: false, // Set to false to avoid issues with async loading
  },

  // Enable debug mode in development
  debug: __DEV__,
});

export default i18n;

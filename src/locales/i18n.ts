import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import es from "./es.json";
import en from "./en.json";

const LANGUAGE_KEY = "APP_LANGUAGE";

const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Detect device locale, default to Spanish
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "es";
const defaultLang = deviceLocale.startsWith("en") ? "en" : "es";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

// Restore saved language preference
AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
  if (stored && (stored === "es" || stored === "en")) {
    i18n.changeLanguage(stored);
  }
});

export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;

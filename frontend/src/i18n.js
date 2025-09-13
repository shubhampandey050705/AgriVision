// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "AgriVision",
      nav: {
        home: "Home",
        dashboard: "Dashboard",
        fields: "Fields",
        prices: "Prices",
        diseaseDetect: "Disease Detect",
        assistant: "Assistant",
        settings: "Settings",
        login: "Login",
        register: "Register"
      },
      actions: {
        upload: "Upload",
        detect: "Detect",
        speak: "Speak",
        stop: "Stop"
      },
      labels: {
        cropRecommendations: "Crop Recommendations",
        marketPrices: "Market Prices",
        yieldScore: "Yield & Sustainability",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        system: "System",
        askAnything: "Ask in your language…"
      }
    }
  },
  hi: {
    translation: {
      appName: "एग्रीविज़न",
      nav: {
        home: "होम",
        dashboard: "डैशबोर्ड",
        fields: "फील्ड्स",
        prices: "कीमतें",
        diseaseDetect: "रोग पहचान",
        assistant: "सहायक",
        settings: "सेटिंग्स",
        login: "लॉगिन",
        register: "रजिस्टर"
      },
      actions: {
        upload: "अपलोड",
        detect: "पहचानें",
        speak: "बोलें",
        stop: "रोकें"
      },
      labels: {
        cropRecommendations: "फसल सिफारिशें",
        marketPrices: "बाज़ार मूल्य",
        yieldScore: "उपज व स्थिरता",
        language: "भाषा",
        theme: "थीम",
        light: "हल्का",
        dark: "गहरा",
        system: "सिस्टम",
        askAnything: "अपनी भाषा में पूछें…"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false
});

export default i18n;

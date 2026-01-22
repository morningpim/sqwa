import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadLanguage } from "./loadNamespaces";

const LANG_KEY = "lang";
const fallbackLng = "th";
const lng = localStorage.getItem(LANG_KEY) || fallbackLng;

const resources = {
  th: loadLanguage("th"),
  en: loadLanguage("en")
};

i18n.use(initReactI18next).init({
  lng,
  fallbackLng,
  resources,
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;

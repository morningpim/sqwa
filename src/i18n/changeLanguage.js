import i18n from "./index";

const LANG_KEY = "lang";

export function changeLanguage(lng) {
  i18n.changeLanguage(lng);
  localStorage.setItem(LANG_KEY, lng);
}

export function getCurrentLanguage() {
  return i18n.language || localStorage.getItem(LANG_KEY) || "th";
}

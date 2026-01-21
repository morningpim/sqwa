import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import th from "./th.json";
import en from "./en.json";

i18n
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem("lang") || "th",
    fallbackLng: "th",

    // ✅ ระบุ namespace ที่มี
    ns: [
      "common",
      "land",
      "broadcast",
      "adminBroadcast",
      "admin",
      "rolePicker",
      "sale",
      "sell",
      "map",
      "chat",
      "payment",
      "investor",
      "investorProfile",
      "eia",
      "dashboard",
      "unlock"
    ],

    // ✅ ค่า default (หน้าไหนไม่ระบุจะใช้ common)
    defaultNS: "common",

    // ✅ map namespace → object ให้ตรง
    resources: {
      th: {
        common: th.common,
        land: th.land,
        broadcast: th.broadcast,
        adminBroadcast: th.adminBroadcast,
        admin: th.admin,
        rolePicker: th.rolePicker,
        sale: th.sale,
        sell: th.sell,
        map: th.map,
        chat: th.chat,
        payment: th.payment,
        investor: th.investor,
        investorProfile: th.investorProfile,
        eia: th.eia,
        dashboard: th.dashboard,
        unlock: th.unlock
      },
      en: {
        common: en.common,
        land: en.land,
        broadcast: en.broadcast,
        adminBroadcast: en.adminBroadcast,
        admin: en.admin,
        rolePicker: en.rolePicker,
        sale: en.sale,
        sell: en.sell,
        map: en.map,
        chat: en.chat,
        payment: en.payment,
        investor: en.investor,
        investorProfile: en.investorProfile,
        eia: en.eia,
        dashboard: en.dashboard,
        unlock: en.unlock
      }
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

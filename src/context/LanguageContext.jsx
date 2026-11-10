import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("bek_lang") || "ar",
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("bek_lang", lang);
  }, [lang]);

  const toggleLang = useCallback(
    () => setLang((l) => (l === "ar" ? "en" : "ar")),
    [],
  );

  // t("nav.home") looks up the text in the current language
  const t = useCallback(
    (key) => {
      const value = key
        .split(".")
        .reduce((obj, k) => (obj ? obj[k] : undefined), translations[lang]);
      return value ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggleLang, t, isRTL: lang === "ar" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};

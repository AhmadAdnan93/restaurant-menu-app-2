"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Locale, translations, getStoredLocale, setStoredLocale } from "@/lib/translations";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations.en;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const l = getStoredLocale();
    setLocaleState(l);
    setStoredLocale(l);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    setStoredLocale(l);
  };

  if (!mounted) return <>{children}</>;
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  return ctx ?? { locale: "en" as Locale, setLocale: () => {}, t: translations.en };
}

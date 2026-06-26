"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, LanguageCode, LANGUAGES } from "@/locales";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: typeof dictionaries.en;
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cancerguard_lang') as LanguageCode;
    if (stored && dictionaries[stored]) {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = (code: LanguageCode) => {
    if (dictionaries[code]) {
      setLanguageState(code);
      localStorage.setItem('cancerguard_lang', code);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  // Fallback to english if translation is somehow missing
  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: LANGUAGES }}>
      <div dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown, Search } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.localName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLang = availableLanguages.find((l) => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-teal-400" />
        <span className="text-xs font-bold hidden sm:inline">{selectedLang?.localName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                  aria-label="Search languages"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {filteredLanguages.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">No languages found</p>
              ) : (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                      language === lang.code
                        ? "bg-teal-500/10 text-teal-400 font-bold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-sm block">{lang.localName}</span>
                      <span className="text-[10px] text-slate-500">{lang.name}</span>
                    </div>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { en } from './en';
import { hi } from './hi';

// We map available languages to their dictionaries.
// Missing translations will fall back to English.
export const dictionaries: Record<string, typeof en> = {
  en,
  hi,
  mr: en, // Marathi (fallback)
  gu: en, // Gujarati (fallback)
  ta: en, // Tamil (fallback)
  te: en, // Telugu (fallback)
  kn: en, // Kannada (fallback)
  ml: en, // Malayalam (fallback)
  bn: en, // Bengali (fallback)
  pa: en, // Punjabi (fallback)
  ur: en, // Urdu (fallback)
  or: en, // Odia (fallback)
};

export type LanguageCode = keyof typeof dictionaries;

export const LANGUAGES = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', localName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', localName: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', localName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', localName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', localName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', localName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', localName: 'اردو' },
  { code: 'or', name: 'Odia', localName: 'ଓଡ଼ିଆ' },
];

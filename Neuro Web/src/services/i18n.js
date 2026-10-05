// Translation files index — loads i18n JSON by locale key
import en from '../data/i18n/en.json'
import ta from '../data/i18n/ta.json'
import hi from '../data/i18n/hi.json'

const translations = { en, ta, hi }

export function t(lang, key) {
  const dict = translations[lang] || translations.en
  return key.split('.').reduce((obj, k) => obj?.[k], dict) || key
}

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ்',   flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
]

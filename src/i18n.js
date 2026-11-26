import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import tr from './locales/tr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

export const LANGUAGES = [
  { code: 'tr', short: 'TR', name: 'Türkçe' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'ar', short: 'ع', name: 'العربية' },
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'tr',
    supportedLngs: LANGUAGES.map((l) => l.code),
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'golfroshi-lang',
      caches: ['localStorage'],
    },
  })

// Arabic flips the whole page to right-to-left
function applyDirection() {
  const lang = i18n.resolvedLanguage
  document.documentElement.lang = lang
  document.documentElement.dir = i18n.dir(lang)
}

applyDirection()
i18n.on('languageChanged', applyDirection)

// Text written in three languages, like { tr, en, ar }; a missing language falls back to the others
export function pick(text, lang) {
  if (!text || typeof text === 'string') return text ?? ''
  return text[lang] || text.tr || text.en || text.ar || ''
}

export default i18n

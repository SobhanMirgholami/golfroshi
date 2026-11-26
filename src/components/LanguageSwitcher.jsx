import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

// Three small letters instead of a dropdown: quicker, and it stays quiet in the header
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = i18n.resolvedLanguage

  return (
    <div role="group" aria-label={t('language')} className="flex items-center rounded-full border border-line p-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          title={lang.name}
          aria-label={lang.name}
          aria-pressed={current === lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold transition-colors ${
            current === lang.code ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
          }`}
        >
          {lang.short}
        </button>
      ))}
    </div>
  )
}

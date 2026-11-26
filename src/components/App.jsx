import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'

export default function App() {
  const { t } = useTranslation()
  return (
    <main className="grid min-h-svh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-display text-5xl">{t('hero.title')}</h1>
        <div className="flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle labels={{ light: t('theme.light'), dark: t('theme.dark') }} />
        </div>
      </div>
    </main>
  )
}

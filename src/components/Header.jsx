import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export default function Header({ children }) {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {children}
          <LanguageSwitcher />
          <ThemeToggle labels={{ light: t('theme.light'), dark: t('theme.dark') }} />
        </div>
      </div>
    </header>
  )
}

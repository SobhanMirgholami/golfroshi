import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from '@phosphor-icons/react'
import { applyTheme, getTheme, isDark, onSystemChange, setTheme } from '../lib/theme'

export default function ThemeToggle({ labels = { light: 'Light theme', dark: 'Dark theme' } }) {
  const [theme, setThemeState] = useState(getTheme)
  const [, refresh] = useState(0)
  const dark = isDark(theme)

  useEffect(() => {
    return onSystemChange(() => {
      applyTheme(getTheme())
      refresh((n) => n + 1)
    })
  }, [])

  function toggle(event) {
    const next = dark ? 'light' : 'dark'
    const apply = () => {
      setTheme(next)
      setThemeState(next)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) {
      apply()
      return
    }

    // the new theme grows out of the button as a circle
    const box = event.currentTarget.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = document.startViewTransition(() => flushSync(apply))
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button type="button" onClick={toggle} className="icon-btn" aria-label={dark ? labels.light : labels.dark} title={dark ? labels.light : labels.dark}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

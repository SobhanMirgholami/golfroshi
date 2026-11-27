import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from '@phosphor-icons/react'
import { MotionConfig, motion } from 'motion/react'
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

    // plays even with reduce motion on; browsers without view transitions get a colour fade
    if (!document.startViewTransition) {
      const root = document.documentElement
      root.classList.add('theme-fade')
      apply()
      setTimeout(() => root.classList.remove('theme-fade'), 500)
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
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 550,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <MotionConfig reducedMotion="never">
      <button type="button" onClick={toggle} className="icon-btn" aria-label={dark ? labels.light : labels.dark} title={dark ? labels.light : labels.dark}>
        <motion.span
          key={dark ? 'sun' : 'moon'}
          className="inline-flex"
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </button>
    </MotionConfig>
  )
}

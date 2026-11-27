import { useEffect, useRef } from 'react'

// Petals drifting down behind the hero text.
// Kept light for phones: a handful of small SVGs, animated with CSS transform and opacity only
// (no JavaScript per frame), fewer petals on small screens, paused when the hero is off screen,
// and switched off completely for "reduce motion".
const PETALS = [
  { left: 6, size: 18, duration: 14, delay: 0, drift: 40, tone: 'accent' },
  { left: 18, size: 12, duration: 11, delay: 4, drift: -30, tone: 'leaf' },
  { left: 31, size: 16, duration: 16, delay: 8, drift: 60, tone: 'accent' },
  { left: 47, size: 10, duration: 12, delay: 2, drift: -50, tone: 'accent', wide: true },
  { left: 58, size: 20, duration: 17, delay: 6, drift: 30, tone: 'leaf', wide: true },
  { left: 71, size: 14, duration: 13, delay: 1, drift: -40, tone: 'accent' },
  { left: 84, size: 17, duration: 15, delay: 9, drift: 50, tone: 'accent', wide: true },
  { left: 93, size: 11, duration: 12, delay: 5, drift: -20, tone: 'leaf', wide: true },
]

export default function HeroPetals() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry.isIntersecting ? 'false' : 'true'
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="hero-petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 20 28"
          className={`petal ${p.wide ? 'petal-wide' : ''}`}
          style={{
            '--left': `${p.left}%`,
            '--size': `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `-${p.delay}s`,
            '--drift': `${p.drift}px`,
            color: `var(--${p.tone})`,
          }}
        >
          <path d="M10 0C16 6 20 13 16 22 14 26 6 26 4 22 0 13 4 6 10 0Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  )
}

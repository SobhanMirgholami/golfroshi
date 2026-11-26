import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function FlowerMark({ className = 'size-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="translate(16 13)" fill="var(--accent)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} rx="3.6" ry="6" transform={`rotate(${a}) translate(0 -4.6)`} />
        ))}
        <circle r="2.6" fill="var(--paper)" />
      </g>
      <path d="M16 19 C16 24 15 27 12.5 30" stroke="var(--leaf)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo() {
  const { t } = useTranslation()
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={t('brand.name')}>
      <FlowerMark className="size-8 transition-transform duration-500 group-hover:rotate-[72deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-tight italic" lang="en">Golfroshi</span>
        <span className="mt-1 text-[0.65rem] tracking-[0.2em] text-muted uppercase">{t('brand.tagline')}</span>
      </span>
    </Link>
  )
}

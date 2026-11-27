import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { pick } from '../i18n'
import { formatPrice } from '../lib/format'
import { useCategoryName } from '../lib/categories'

export default function BouquetCard({ bouquet, number, onOpen }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const name = pick(bouquet.name, lang)
  const categoryName = useCategoryName()

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type="button" onClick={() => onOpen(bouquet)} className="group block w-full text-start" aria-label={t('catalog.details', { name })}>
        <div className="arch relative aspect-[3/4] overflow-hidden bg-paper-2">
          <img
            src={bouquet.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute top-[18%] start-4 rounded-full bg-paper/85 px-2.5 py-1 font-display text-xs italic backdrop-blur">
            {t('catalog.number', { n: String(number).padStart(2, '0') })}
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">{name}</h3>
          <span className="shrink-0 text-sm font-medium tabular-nums">{formatPrice(bouquet.price, lang)}</span>
        </div>
        <p className="mt-1 text-xs tracking-[0.18em] text-muted uppercase">{categoryName(bouquet.category)}</p>
      </button>
    </motion.li>
  )
}

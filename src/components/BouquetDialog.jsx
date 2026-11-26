import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from '@phosphor-icons/react'
import { pick } from '../i18n'
import { formatPrice } from '../lib/format'

// Native <dialog>: focus trap, Esc to close and a backdrop come for free
export default function BouquetDialog({ bouquet, onClose }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (bouquet && !dialog.open) dialog.showModal()
    if (!bouquet && dialog.open) dialog.close()
  }, [bouquet])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(56rem,calc(100%-2rem))] overflow-hidden rounded-[2rem] border border-line bg-card p-0 text-ink backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {bouquet && (
        <div className="grid md:grid-cols-[1fr_1.1fr]">
          <img src={bouquet.image} alt={pick(bouquet.name, lang)} className="aspect-[3/4] w-full object-cover max-md:max-h-[45svh]" />
          <div className="relative flex flex-col gap-5 p-7 sm:p-10">
            <button type="button" onClick={onClose} className="icon-btn absolute top-5 end-5" aria-label={t('catalog.close')}>
              <X size={18} />
            </button>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">{t(`categories.${bouquet.category}`)}</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">{pick(bouquet.name, lang)}</h2>
            <p className="leading-relaxed text-muted">{pick(bouquet.description, lang)}</p>
            <p className="mt-auto border-t border-line pt-5 font-display text-3xl tabular-nums">{formatPrice(bouquet.price, lang)}</p>
          </div>
        </div>
      )}
    </dialog>
  )
}

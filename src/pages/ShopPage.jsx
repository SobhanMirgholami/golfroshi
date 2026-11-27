import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass } from '@phosphor-icons/react'
import Header from '../components/Header'
import BouquetCard from '../components/BouquetCard'
import BouquetDialog from '../components/BouquetDialog'
import { useCategories } from '../lib/categories'
import { pick } from '../i18n'

export default function ShopPage({ bouquets }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)
  const categories = useCategories()

  // customers only ever see what is in the shop right now
  const available = useMemo(() => bouquets.filter((b) => b.isAvailable), [bouquets])
  // only show categories that have something on the table right now
  const usedCategories = categories.filter((c) => available.some((b) => b.category === c.id))

  const shown = available.filter((b) => {
    if (category !== 'all' && b.category !== category) return false
    const q = query.trim().toLocaleLowerCase(lang)
    if (!q) return true
    // search every language, so a Turkish name still matches while browsing in English
    return [...Object.values(b.name ?? {}), pick(b.description, lang)].some((text) => text?.toLocaleLowerCase(lang).includes(q))
  })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid gap-8 py-14 sm:py-20 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs tracking-[0.22em] text-leaf uppercase">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-leaf" />
              </span>
              {t('hero.eyebrow')}
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] font-light tracking-tight text-balance sm:text-7xl">{t('hero.title')}</h1>
          </div>
          <div className="flex flex-col gap-4 md:pb-3">
            <p className="leading-relaxed text-muted">{t('hero.subtitle')}</p>
            <p className="font-display text-lg italic">{t('hero.count', { count: available.length })}</p>
          </div>
        </section>

        {available.length > 0 && (
          <div className="sticky top-16 z-20 -mx-4 flex flex-col gap-3 border-y border-line bg-paper/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:border sm:px-3">
            <div role="group" aria-label={t('form.category')} className="-mx-1 flex gap-1 overflow-x-auto px-1">
              {[{ id: 'all' }, ...usedCategories].map(({ id: c, name }) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${category === c ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
                >
                  {c === 'all' ? t('catalog.all') : pick(name, lang)}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-64">
              <span className="sr-only">{t('catalog.search')}</span>
              <MagnifyingGlass size={16} className="pointer-events-none absolute top-1/2 start-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('catalog.search')}
                className="w-full rounded-full border border-line bg-card py-2 ps-10 pe-4 text-sm focus:border-ink focus:outline-none"
              />
            </label>
          </div>
        )}

        <section className="py-12">
          {available.length === 0 ? (
            <p className="py-20 text-center font-display text-2xl text-muted italic">{t('catalog.empty')}</p>
          ) : shown.length === 0 ? (
            <p className="py-20 text-center text-muted">{t('catalog.noResults')}</p>
          ) : (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {shown.map((b) => (
                  <BouquetCard key={b.id} bouquet={b} number={available.indexOf(b) + 1} onOpen={setOpen} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>
      </main>

      <footer className="mt-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t('footer.note')}</p>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-ink">{t('footer.admin')}</Link>
            <a href="https://sobhan-cosmo.vercel.app" target="_blank" rel="noreferrer" className="hover:text-ink">{t('footer.credit')}</a>
          </div>
        </div>
      </footer>

      <BouquetDialog bouquet={open} onClose={() => setOpen(null)} />
    </>
  )
}

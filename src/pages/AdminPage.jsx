import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowCounterClockwise, PencilSimple, Plus, SignOut, Storefront, Trash } from '@phosphor-icons/react'
import Header from '../components/Header'
import BouquetForm from '../components/BouquetForm'
import { pick } from '../i18n'
import { formatPrice } from '../lib/format'
import { signOut } from '../lib/adminAccess'
import { isDemo } from '../lib/supabaseClient'

export default function AdminPage({ bouquets, onAdd, onUpdate, onToggle, onDelete, onReset }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const available = bouquets.filter((b) => b.isAvailable).length
  // null: form closed, {}: adding, a bouquet: editing it
  const [editing, setEditing] = useState(null)

  return (
    <>
      <Header>
        <Link to="/" className="icon-btn" title={t('admin.viewSite')} aria-label={t('admin.viewSite')}>
          <Storefront size={18} />
        </Link>
        <button type="button" onClick={() => signOut()} className="icon-btn" title={t('admin.signOut')} aria-label={t('admin.signOut')}>
          <SignOut size={18} className="rtl:-scale-x-100" />
        </button>
      </Header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="flex flex-wrap items-center gap-2 text-xs tracking-[0.2em] text-muted uppercase">
              {t('admin.stats', { available, total: bouquets.length })}
              {isDemo && <span className="rounded-full bg-accent/15 px-2 py-0.5 tracking-normal text-accent normal-case">{t('admin.demoBadge')}</span>}
            </p>
            <h1 className="font-display text-5xl">{t('admin.title')}</h1>
            <p className="max-w-xl text-muted">{t('admin.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isDemo && (
              <button type="button" onClick={onReset} className="btn btn-outline">
                <ArrowCounterClockwise size={16} /> {t('admin.resetDemo')}
              </button>
            )}
            <button type="button" onClick={() => setEditing({})} className="btn btn-primary">
              <Plus size={16} /> {t('admin.add')}
            </button>
          </div>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {bouquets.map((b) => {
            const name = pick(b.name, lang)
            return (
              <li key={b.id} className={`flex items-center gap-4 py-4 transition-opacity ${b.isAvailable ? '' : 'opacity-60'}`}>
                <img src={b.image} alt="" className={`arch h-20 w-16 shrink-0 object-cover ${b.isAvailable ? '' : 'grayscale'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl">{name}</p>
                  <p className="text-sm text-muted">
                    {t(`categories.${b.category}`)} · {formatPrice(b.price, lang)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {/* a switch: on means the bouquet is shown to customers */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={b.isAvailable}
                    onClick={() => onToggle(b.id)}
                    title={b.isAvailable ? t('admin.markSoldOut') : t('admin.markAvailable')}
                    className="flex items-center gap-2 rounded-full border border-line py-1.5 ps-1.5 pe-3 text-xs transition-colors hover:border-ink"
                  >
                    <span className={`relative h-5 w-9 rounded-full transition-colors ${b.isAvailable ? 'bg-leaf' : 'bg-line'}`}>
                      <span className={`absolute top-0.5 size-4 rounded-full bg-paper shadow transition-all ${b.isAvailable ? 'start-[1.125rem]' : 'start-0.5'}`} />
                    </span>
                    <span className="hidden sm:inline">{b.isAvailable ? t('admin.available') : t('admin.soldOut')}</span>
                  </button>
                  <button type="button" onClick={() => setEditing(b)} className="icon-btn" title={t('admin.edit')} aria-label={`${t('admin.edit')}: ${name}`}>
                    <PencilSimple size={16} />
                  </button>
                  <button type="button" onClick={() => onDelete(b.id)} className="icon-btn hover:border-danger hover:text-danger" title={t('admin.delete')} aria-label={`${t('admin.delete')}: ${name}`}>
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {bouquets.length === 0 && <p className="py-16 text-center text-muted">{t('admin.empty')}</p>}
      </main>

      <BouquetForm bouquet={editing} onSave={editing?.id ? onUpdate : onAdd} onClose={() => setEditing(null)} />
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PencilSimple, Plus, SignOut, Storefront } from '@phosphor-icons/react'
import Header from '../components/Header'
import BouquetForm from '../components/BouquetForm'
import { pick } from '../i18n'
import { formatPrice } from '../lib/format'
import { signOut } from '../lib/adminAccess'
import { isDemo } from '../lib/supabaseClient'

export default function AdminPage({ bouquets, onAdd, onUpdate }) {
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
          <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted uppercase">
            {t('admin.stats', { available, total: bouquets.length })}
            {isDemo && <span className="rounded-full bg-accent/15 px-2 py-0.5 tracking-normal text-accent normal-case">{t('admin.demoBadge')}</span>}
          </p>
          <h1 className="font-display text-5xl">{t('admin.title')}</h1>
          <p className="max-w-xl text-muted">{t('admin.subtitle')}</p>
        </div>
          <button type="button" onClick={() => setEditing({})} className="btn btn-primary self-start sm:self-auto">
            <Plus size={16} /> {t('admin.add')}
          </button>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {bouquets.map((b) => (
            <li key={b.id} className="flex items-center gap-4 py-4">
              <img src={b.image} alt="" className="arch h-20 w-16 shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl">{pick(b.name, lang)}</p>
                <p className="text-sm text-muted">{t(`categories.${b.category}`)} · {formatPrice(b.price, lang)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => setEditing(b)} className="icon-btn" title={t('admin.edit')} aria-label={`${t('admin.edit')}: ${pick(b.name, lang)}`}>
                  <PencilSimple size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {bouquets.length === 0 && <p className="py-16 text-center text-muted">{t('admin.empty')}</p>}
      </main>

      <BouquetForm bouquet={editing} onSave={editing?.id ? onUpdate : onAdd} onClose={() => setEditing(null)} />
    </>
  )
}

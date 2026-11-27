import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from '@phosphor-icons/react'
import { LANGUAGES, pick } from '../i18n'
import { useCategories } from '../lib/categories'

const empty = { tr: '', en: '', ar: '' }

// Add and remove categories; names are written in all three languages
export default function CategoryManager({ bouquets, onAdd, onDelete }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const categories = useCategories()
  const [name, setName] = useState(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = Object.fromEntries(Object.entries(name).map(([k, v]) => [k, v.trim()]))
    if (LANGUAGES.some((l) => !trimmed[l.code])) {
      setError(t('admin.categoryNameMissing'))
      return
    }
    setSaving(true)
    try {
      await onAdd({ name: trimmed })
      setName(empty)
      setError('')
    } catch {
      // the toast explains it; keep what was typed
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-16" aria-labelledby="categories-title">
      <h2 id="categories-title" className="font-display text-3xl">{t('admin.categoriesTitle')}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">{t('admin.categoriesHint')}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => {
          const count = bouquets.filter((b) => b.category === c.id).length
          const label = pick(c.name, lang)
          return (
            <li key={c.id} className="flex items-center gap-1 rounded-full border border-line py-1 ps-4 pe-1 text-sm">
              <span>{label}</span>
              <span className="text-xs text-muted">· {t('admin.categoryCount', { count })}</span>
              <button
                type="button"
                onClick={() => onDelete(c, count)}
                className="ms-1 inline-flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                aria-label={t('admin.deleteCategory', { name: label })}
                title={count > 0 ? t('admin.categoryInUse', { name: label }) : t('admin.deleteCategory', { name: label })}
              >
                <X size={14} />
              </button>
            </li>
          )
        })}
      </ul>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-3 rounded-3xl border border-dashed border-line p-4 sm:flex-row sm:items-start">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {LANGUAGES.map((l) => (
            <input
              key={l.code}
              lang={l.code}
              dir={i18n.dir(l.code)}
              value={name[l.code]}
              onChange={(e) => {
                setName((n) => ({ ...n, [l.code]: e.target.value }))
                setError('')
              }}
              placeholder={l.name}
              aria-label={t('admin.categoryPlaceholder', { lang: l.name })}
              maxLength={40}
              className="field py-2.5"
            />
          ))}
        </div>
        <button type="submit" disabled={saving} className="btn btn-outline py-3">
          <Plus size={16} /> {t('admin.addCategory')}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </section>
  )
}

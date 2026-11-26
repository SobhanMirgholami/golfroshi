import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageSquare, X } from '@phosphor-icons/react'
import { LANGUAGES } from '../i18n'
import { CATEGORIES } from '../lib/sampleBouquets'
import { optimizeImage } from '../lib/optimizeImage'

const emptyText = { tr: '', en: '', ar: '' }
const emptyBouquet = { name: emptyText, description: emptyText, price: '', category: '', isAvailable: true, image: '' }

// One form for adding and editing. Name and description are written in all three languages.
export default function BouquetForm({ bouquet, onSave, onClose }) {
  const { t, i18n } = useTranslation()
  const ref = useRef(null)
  const fileInput = useRef(null)
  const [form, setForm] = useState(emptyBouquet)
  const [tab, setTab] = useState(i18n.resolvedLanguage)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const editing = Boolean(bouquet?.id)

  useEffect(() => {
    const dialog = ref.current
    if (bouquet) {
      setForm({ ...emptyBouquet, ...bouquet, name: { ...emptyText, ...bouquet.name }, description: { ...emptyText, ...bouquet.description } })
      setErrors({})
      setTab(i18n.resolvedLanguage)
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
    // only reset when a different bouquet is opened, not when the page language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bouquet])

  const setText = (field, lang, value) => setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }))

  async function handleImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((e) => ({ ...e, image: t('form.errors.imageType') }))
      return
    }
    try {
      const image = await optimizeImage(file)
      setForm((f) => ({ ...f, image }))
      setErrors((e) => ({ ...e, image: undefined }))
    } catch {
      setErrors((e) => ({ ...e, image: t('form.errors.imageFailed') }))
    }
  }

  function validate() {
    const next = {}
    if (LANGUAGES.some((l) => !form.name[l.code].trim())) next.name = t('form.errors.name')
    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0) next.price = t('form.errors.price')
    if (!CATEGORIES.includes(form.category)) next.category = t('form.errors.category')
    if (!form.image) next.image = t('form.errors.image')
    setErrors(next)
    // jump to the first language that is missing a name
    if (next.name) setTab(LANGUAGES.find((l) => !form.name[l.code].trim()).code)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const trim = (text) => Object.fromEntries(Object.entries(text).map(([k, v]) => [k, v.trim()]))
      await onSave({ ...form, name: trim(form.name), description: trim(form.description), price: Math.round(Number(form.price)) })
      onClose()
    } catch {
      // the toast already explains what went wrong; keep the form open so nothing typed is lost
    } finally {
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => saving && e.preventDefault()}
      className="m-auto w-[min(44rem,calc(100%-2rem))] rounded-[2rem] border border-line bg-card p-0 text-ink backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">{editing ? t('form.editTitle') : t('form.addTitle')}</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label={t('form.cancel')} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[10rem_1fr]">
          <div>
            <span className="label">{t('form.image')}</span>
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              className={`arch group relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden border border-dashed bg-paper-2 ${errors.image ? 'border-danger' : 'border-line'}`}
            >
              {form.image ? (
                <img src={form.image} alt="" className="size-full object-cover" />
              ) : (
                <ImageSquare size={28} className="text-muted" />
              )}
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-paper/90 px-2 py-1 text-center text-xs backdrop-blur">
                {form.image ? t('form.changeImage') : t('form.chooseImage')}
              </span>
            </button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />
            <p className="mt-2 text-xs text-muted">{errors.image || t('form.imageHint')}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div role="tablist" className="flex gap-1 rounded-full border border-line p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="tab"
                  aria-selected={tab === l.code}
                  aria-label={t('form.langTab', { lang: l.name })}
                  onClick={() => setTab(l.code)}
                  className={`flex-1 rounded-full py-1.5 text-sm transition-colors ${tab === l.code ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
                >
                  {l.name}
                  {!form.name[l.code].trim() && <span className="ms-1.5 inline-block size-1.5 rounded-full bg-accent align-middle" />}
                </button>
              ))}
            </div>
            {/* the text fields follow the direction of the language being written, not the page */}
            <div dir={i18n.dir(tab)} lang={tab} className="flex flex-col gap-4">
              <label>
                <span className="label">{t('form.name')}</span>
                <input value={form.name[tab]} onChange={(e) => setText('name', tab, e.target.value)} className="field" maxLength={60} />
              </label>
              <label>
                <span className="label">{t('form.description')}</span>
                <textarea value={form.description[tab]} onChange={(e) => setText('description', tab, e.target.value)} className="field min-h-28 resize-y" maxLength={400} />
              </label>
            </div>
            {errors.name && <p className="text-sm text-danger">{errors.name}</p>}

            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="label">{t('form.price')}</span>
                <input type="number" min="1" step="1" inputMode="numeric" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={`field ${errors.price ? 'border-danger' : ''}`} dir="ltr" />
              </label>
              <label>
                <span className="label">{t('form.category')}</span>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={`field ${errors.category ? 'border-danger' : ''}`}>
                  <option value="" disabled>—</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{t(`categories.${c}`)}</option>
                  ))}
                </select>
              </label>
            </div>
            {(errors.price || errors.category) && <p className="text-sm text-danger">{errors.price || errors.category}</p>}

            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} className="size-4 accent-[var(--accent)]" />
              {t('form.availableNow')}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={saving}>{t('form.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('form.saving') : t('form.save')}</button>
        </div>
      </form>
    </dialog>
  )
}

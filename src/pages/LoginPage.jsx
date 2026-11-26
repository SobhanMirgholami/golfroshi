import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import Header from '../components/Header'
import { signIn } from '../lib/adminAccess'
import { isDemo } from '../lib/supabaseClient'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const Back = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch {
      setError(t('login.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100svh-65px)] place-items-center px-4 py-12">
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h1 className="font-display text-4xl">{t('login.title')}</h1>
            <p className="mt-2 text-sm text-muted">{t('login.subtitle')}</p>
          </div>

          {isDemo && <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-xs leading-relaxed text-muted">{t('login.demoHint')}</p>}

          {!isDemo && (
            <label>
              <span className="label">{t('login.email')}</span>
              <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field" dir="ltr" />
            </label>
          )}
          <label>
            <span className="label">{t('login.password')}</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" dir="ltr" />
          </label>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary py-3">
            {busy ? t('login.signingIn') : t('login.submit')}
          </button>
          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-muted hover:text-ink">
            <Back size={14} /> {t('login.back')}
          </Link>
        </form>
      </main>
    </>
  )
}

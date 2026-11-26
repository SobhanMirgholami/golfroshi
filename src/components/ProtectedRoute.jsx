import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Loading from './Loading'
import { getAdminAccess, onAuthChange, signOut } from '../lib/adminAccess'

export default function ProtectedRoute({ children }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState('checking')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    let request = 0
    let timer

    async function check() {
      const id = ++request
      try {
        const result = await getAdminAccess()
        if (active && id === request) setStatus(result.status)
      } catch {
        if (active && id === request) setStatus('error')
      }
    }

    const unsubscribe = onAuthChange((event) => {
      if (!active) return
      if (event === 'SIGNED_OUT') {
        request += 1
        setStatus('signedOut')
        return
      }
      // check again outside the auth callback, so Supabase isn't called from inside its own listener
      clearTimeout(timer)
      timer = setTimeout(() => void check(), 0)
    })

    void check()
    return () => {
      active = false
      clearTimeout(timer)
      unsubscribe()
    }
  }, [retryCount])

  if (status === 'checking') return <Loading label={t('status.checking')} />
  if (status === 'signedOut') return <Navigate to="/login" replace />
  if (status === 'allowed') return children

  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <p role="alert" className="font-display text-2xl">{status === 'error' ? t('login.accessError') : t('login.denied')}</p>
        {status === 'error' && (
          <button type="button" className="btn btn-primary" onClick={() => { setStatus('checking'); setRetryCount((n) => n + 1) }}>
            {t('status.retry')}
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={() => signOut()}>{t('login.otherAccount')}</button>
        <Link to="/" className="text-sm text-muted hover:text-ink">{t('login.back')}</Link>
      </div>
    </main>
  )
}

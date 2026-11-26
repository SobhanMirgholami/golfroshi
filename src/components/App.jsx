import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { useTranslation } from 'react-i18next'
import toast, { Toaster } from 'react-hot-toast'
import ShopPage from '../pages/ShopPage'
import Loading from './Loading'
import { pick } from '../i18n'
import {
  getBouquets,
  createBouquet,
  updateBouquet,
  setBouquetAvailability,
  deleteBouquet,
  resetDemoBouquets,
} from '../lib/productService'

// the admin side is loaded only when someone opens it
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AdminPage = lazy(() => import('../pages/AdminPage'))
const ProtectedRoute = lazy(() => import('./ProtectedRoute'))

export default function App() {
  const { t, i18n } = useTranslation()
  const [bouquets, setBouquets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const deleting = useRef(new Set())

  useEffect(() => {
    let active = true
    getBouquets()
      .then((list) => active && setBouquets(list))
      .catch((err) => active && setError(err?.message || 'network'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [retryCount])

  const fail = (err) => toast.error(t('toast.failed', { message: err?.message || '?' }))

  async function handleAdd(bouquet) {
    try {
      const saved = await createBouquet(bouquet)
      setBouquets((list) => [...list, saved])
      toast.success(t('toast.added'))
    } catch (err) {
      fail(err)
      throw err
    }
  }

  async function handleUpdate(bouquet) {
    try {
      const saved = await updateBouquet(bouquet)
      setBouquets((list) => list.map((b) => (b.id === saved.id ? saved : b)))
      toast.success(t('toast.updated'))
    } catch (err) {
      fail(err)
      throw err
    }
  }

  async function handleToggle(id) {
    const bouquet = bouquets.find((b) => b.id === id)
    if (!bouquet) return
    try {
      const saved = await setBouquetAvailability(id, !bouquet.isAvailable)
      setBouquets((list) => list.map((b) => (b.id === id ? saved : b)))
      toast.success(t('toast.toggled'))
    } catch (err) {
      fail(err)
    }
  }

  async function handleDelete(id) {
    const bouquet = bouquets.find((b) => b.id === id)
    if (!bouquet || deleting.current.has(id)) return
    if (!window.confirm(t('admin.confirmDelete', { name: pick(bouquet.name, i18n.resolvedLanguage) }))) return

    deleting.current.add(id)
    const toastId = toast.loading(t('toast.deleting'))
    try {
      await deleteBouquet(id)
      setBouquets((list) => list.filter((b) => b.id !== id))
      toast.success(t('toast.deleted'), { id: toastId })
    } catch (err) {
      toast.error(t('toast.failed', { message: err?.message || '?' }), { id: toastId })
    } finally {
      deleting.current.delete(id)
    }
  }

  async function handleReset() {
    if (!window.confirm(t('admin.confirmReset'))) return
    setBouquets(await resetDemoBouquets())
    toast.success(t('toast.reset'))
  }

  function withData(page) {
    if (loading) return <Loading label={t('status.loading')} />
    if (error) {
      return (
        <main className="grid min-h-svh place-items-center px-4">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <p role="alert" className="text-danger">{t('status.loadError', { message: error })}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setError('')
                setLoading(true)
                setRetryCount((n) => n + 1)
              }}
            >
              {t('status.retry')}
            </button>
          </div>
        </main>
      )
    }
    return page
  }

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'var(--font-sans)', color: 'var(--ink)', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '999px' },
          }}
        />
        <Suspense fallback={<Loading label={t('status.loading')} />}>
          <Routes>
            <Route path="/" element={withData(<ShopPage bouquets={bouquets} />)} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  {withData(
                    <AdminPage
                      bouquets={bouquets}
                      onAdd={handleAdd}
                      onUpdate={handleUpdate}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onReset={handleReset}
                    />,
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  )
}

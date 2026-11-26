import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { useTranslation } from 'react-i18next'
import ShopPage from '../pages/ShopPage'
import Loading from './Loading'
import { getBouquets } from '../lib/productService'

export default function App() {
  const { t } = useTranslation()
  const [bouquets, setBouquets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

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
        <Routes>
          <Route path="/" element={withData(<ShopPage bouquets={bouquets} />)} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}

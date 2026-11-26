import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './components/App.jsx'
import { applyTheme, getTheme } from './lib/theme'
import { stampBuild } from './lib/buildInfo'

applyTheme(getTheme())
stampBuild()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

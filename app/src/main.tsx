import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './i18n'
import App from './App'
import { queryClient, persister } from './lib/queryClient'
import { LocaleProvider } from './contexts/LocaleContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        buster: 'v1',                    // bump to invalidate persisted cache
      }}
    >
      <LocaleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocaleProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)

/* Register the Service Worker (PWA + push). Auto-updates on new builds. */
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      console.log('[PWA] Service Worker registered', registration?.scope)
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline 🍵')
    },
  })
}

/* Fade out and remove the pre-build splash screen */
const splash = document.getElementById('preload-splash')
if (splash) {
  splash.classList.add('fade-out')
  splash.addEventListener('transitionend', () => splash.remove())
}

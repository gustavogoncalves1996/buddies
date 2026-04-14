import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

/* Fade out and remove the pre-build splash screen */
const splash = document.getElementById('preload-splash')
if (splash) {
  splash.classList.add('fade-out')
  splash.addEventListener('transitionend', () => splash.remove())
}

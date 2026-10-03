import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
// Styles, in cascade order. Vendor styles first (the template's set, minus the
// jQuery plugin skins), then the theme compiled from the template's SCSS, then
// React-specific adjustments.
import 'bootstrap/dist/css/bootstrap.css'
import './assets/vendor/css/linearicons.css'
import './assets/vendor/css/font-awesome.min.css'
import './assets/vendor/css/themify-icons.css'
import './assets/vendor/css/nice-select.css'
import 'nouislider/dist/nouislider.css'
import 'swiper/css'
import 'yet-another-react-lightbox/styles.css'
import './styles/scss/main.scss'
import './styles/app.scss'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

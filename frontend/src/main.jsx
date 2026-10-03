import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Vendor styles (same set the HTML template loaded, minus the jQuery plugin skins)
import 'bootstrap/dist/css/bootstrap.css'
import './assets/vendor/css/linearicons.css'
import './assets/vendor/css/font-awesome.min.css'
import './assets/vendor/css/themify-icons.css'
import './assets/vendor/css/nice-select.css'
import 'nouislider/dist/nouislider.css'
import 'swiper/css'
import 'yet-another-react-lightbox/styles.css'

// Theme styles (compiled from the template's original SCSS) + React-specific adjustments
import './styles/scss/main.scss'
import './styles/app.scss'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

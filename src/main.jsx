/**
 * VA Studio — Application Bootstrap
 *
 * Mounts the root React component into the DOM.
 * The <App /> component handles all routing internally via react-router-dom.
 *
 * Entry points:
 *   /                     → WelcomePage (template gallery)
 *   /preview/:templateId  → Live template preview
 *
 * @see {@link ./App.jsx} for router configuration
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

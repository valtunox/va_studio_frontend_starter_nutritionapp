/**
 * VA Studio Frontend — Nutrition App Standalone
 *
 * This is a standalone version of the Nutrition App template.
 * It renders the Nutrition App template directly as the main interface.
 *
 * Routes:
 *   /  → Nutrition App template (default)
 *
 * Backend connectivity:
 *   A connectivity test banner appears at the top showing real-time backend status.
 *
 * @module App
 * @version 1.0.0
 */

import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BackendStatusProvider, useBackendContext } from './context/BackendStatusContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import TemplateApp from '../templates/nutritionapp/App.jsx'

/* ------------------------------------------------------------------ */
/*  Backend Connectivity Test Banner                                   */
/* ------------------------------------------------------------------ */

function ConnectivityBanner() {
  const { status, latency, details, retry } = useBackendContext()

  const statusConfig = {
    checking: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      icon: '\u23F3',
      label: 'Checking backend...',
    },
    online: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: '\u2713',
      label: 'Backend Online',
    },
    degraded: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: '\u26A0',
      label: 'Backend Degraded',
    },
    offline: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-700 dark:text-rose-400',
      icon: '\u2715',
      label: 'Backend Offline',
    },
  }

  const config = statusConfig[status] || statusConfig.checking

  return (
    <div className={`${config.bg} border-b border-slate-200 dark:border-slate-700`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <span className={`font-medium ${config.text}`}>{config.label}</span>
          {latency && (
            <span className="text-slate-500 dark:text-slate-400">
              {latency}ms
            </span>
          )}
          {details && (
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {details.app} v{details.version}
            </span>
          )}
        </div>
        <button
          onClick={retry}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-xs font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Template Loader (loading state)                                    */
/* ------------------------------------------------------------------ */

function TemplateLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page (Nutrition App Template with Connectivity Banner)       */
/* ------------------------------------------------------------------ */

function HomePage() {
  const { isDark } = useTheme()

  return (
    <div className={isDark ? 'dark' : ''}>
      <ConnectivityBanner />
      <Suspense fallback={<TemplateLoader />}>
        <TemplateApp />
      </Suspense>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <HomePage /> },
])

/**
 * Root application component.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BackendStatusProvider>
          <RouterProvider router={router} />
        </BackendStatusProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

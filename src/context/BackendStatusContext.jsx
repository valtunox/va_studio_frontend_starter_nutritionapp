/**
 * BackendStatusContext — Shares backend connectivity state across the app.
 *
 * Wraps the useBackendStatus hook in a React context so any component
 * in the tree can read the current backend status without prop drilling.
 *
 * Usage:
 *   <BackendStatusProvider>
 *     <RouterProvider ... />
 *   </BackendStatusProvider>
 *
 *   // In any child component:
 *   const { status, latency, details, retry } = useBackendContext()
 *
 * @module BackendStatusContext
 */

import { createContext, useContext } from 'react'
import useBackendStatus from '@/hooks/useBackendStatus'

const BackendStatusContext = createContext({
  status: 'checking',
  details: null,
  latency: null,
  lastCheck: null,
  retry: () => {},
})

export function BackendStatusProvider({ children }) {
  const value = useBackendStatus()
  return (
    <BackendStatusContext.Provider value={value}>
      {children}
    </BackendStatusContext.Provider>
  )
}

export function useBackendContext() {
  return useContext(BackendStatusContext)
}

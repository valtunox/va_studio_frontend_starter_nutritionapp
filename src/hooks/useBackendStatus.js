/**
 * useBackendStatus — Real-time backend connectivity hook
 *
 * Polls the VA Studio backend health endpoints to determine if the
 * FastAPI server is reachable and its dependencies (DB, Redis) are healthy.
 *
 * Strategy:
 *   1. First calls GET /api/v1/health (basic liveness)
 *   2. If reachable, calls GET /api/v1/health/ready (dependency checks)
 *   3. Combines both to determine: online | degraded | offline
 *
 * Returns:
 *   status    — 'checking' | 'online' | 'offline' | 'degraded'
 *   details   — Merged health + readiness response from backend
 *   latency   — Round-trip time in ms for the last successful check
 *   lastCheck — ISO timestamp of the last check attempt
 *   retry     — Function to manually trigger a re-check
 *
 * Polling:
 *   - Every 30s when online
 *   - Every 10s when offline (faster retry)
 *   - Cleans up on unmount
 *
 * @module useBackendStatus
 * @see {@link ../lib/api.js} healthApi
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { healthApi } from '@/lib/api'

const POLL_ONLINE_MS = 30_000
const POLL_OFFLINE_MS = 10_000

export default function useBackendStatus() {
  const [status, setStatus] = useState('checking')
  const [details, setDetails] = useState(null)
  const [latency, setLatency] = useState(null)
  const [lastCheck, setLastCheck] = useState(null)
  const intervalRef = useRef(null)

  const check = useCallback(async () => {
    const start = performance.now()
    try {
      const healthRes = await healthApi.check()
      const ms = Math.round(performance.now() - start)
      setLatency(ms)

      const healthData = healthRes.data || {}

      let readyData = {}
      let services = {}
      try {
        const readyRes = await healthApi.ready()
        readyData = readyRes.data || {}
        services = readyData.checks || {}
      } catch {
        services = { database: false, redis: false }
      }

      const merged = {
        app: healthData.app || healthData.name || 'VA Studio Backend',
        name: healthData.app || healthData.name || 'VA Studio Backend',
        version: healthData.version || readyData.version || '-',
        environment: healthData.environment || '-',
        status: healthData.status,
        readiness: readyData.status,
        services,
      }

      setDetails(merged)
      setLastCheck(new Date().toISOString())

      const allHealthy = Object.values(services).every((v) => v === true)
      setStatus(allHealthy ? 'online' : 'degraded')
    } catch {
      setLatency(null)
      setDetails(null)
      setLastCheck(new Date().toISOString())
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  useEffect(() => {
    const ms = status === 'offline' ? POLL_OFFLINE_MS : POLL_ONLINE_MS
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(check, ms)
    return () => clearInterval(intervalRef.current)
  }, [status, check])

  return { status, details, latency, lastCheck, retry: check }
}

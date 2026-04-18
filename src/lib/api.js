/**
 * Simulated API layer for VA Studio.
 *
 * All calls are simulated locally — no axios, no backend required.
 * Each API returns a Promise that resolves after a short delay
 * to mimic real network latency.
 */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const simResponse = (data) => delay(150 + Math.random() * 200).then(() => ({ data }))

// ── Health API (simulated) ────────────────────────────────

export const healthApi = {
  check: () =>
    simResponse({
      app: 'VA Studio Backend',
      version: '1.0.0',
      status: 'healthy',
      environment: 'development',
    }),
  ready: () =>
    simResponse({
      status: 'ready',
      version: '1.0.0',
      checks: { database: true, redis: true },
    }),
}

// ── Templates API (simulated) ─────────────────────────────

export const templatesApi = {
  list: () => simResponse([]),
  get: (id) => simResponse({ id, name: id }),
  categories: () => simResponse([]),
  preview: (id) => simResponse({ id }),
}

// ── Chat API (simulated) ──────────────────────────────────

export const chatApi = {
  createSession: () => simResponse({ session_id: crypto.randomUUID() }),
  sendMessage: (message) =>
    simResponse({ reply: `Simulated response to: "${message}"` }),
  getSession: (sessionId) => simResponse({ session_id: sessionId }),
  getHistory: () => simResponse({ messages: [] }),
  submitTemplateRequest: () => simResponse({ request_id: crypto.randomUUID(), status: 'pending' }),
  getRequestStatus: (requestId) => simResponse({ request_id: requestId, status: 'completed' }),
}

// ── Projects API (simulated) ──────────────────────────────

export const projectsApi = {
  list: () => simResponse([]),
  get: (id) => simResponse({ id }),
  create: (data) => simResponse({ id: crypto.randomUUID(), ...data }),
  update: (id, data) => simResponse({ id, ...data }),
  delete: (id) => simResponse({ id, deleted: true }),
  getPublic: () => simResponse([]),
}

// ── AI / Chat API (simulated) ─────────────────────────────

export const aiApi = {
  chat: (message) =>
    simResponse({ reply: `Simulated AI response to: "${message}"` }),
  agents: () => simResponse([]),
  status: () => simResponse({ status: 'available' }),
  deleteConversation: (id) => simResponse({ id, deleted: true }),
}

const api = { healthApi, templatesApi, chatApi, projectsApi, aiApi }
export default api

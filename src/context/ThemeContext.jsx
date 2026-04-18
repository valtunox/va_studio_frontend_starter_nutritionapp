import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const THEMES = {
  default: { label: 'Purple', color: '#7c3aed', primary: '262.1 83.3% 57.8%', ring: '262.1 83.3% 57.8%', primaryFg: '210 40% 98%' },
  ocean:   { label: 'Ocean',  color: '#2563eb', primary: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%', primaryFg: '210 40% 98%' },
  slate:   { label: 'Slate',  color: '#475569', primary: '215.4 16.3% 46.9%', ring: '215.4 16.3% 46.9%', primaryFg: '210 40% 98%' },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem('va-theme') || 'default' } catch { return 'default' }
  })
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('va-dark') === 'true' } catch { return false }
  })

  const setTheme = useCallback((t) => {
    setThemeState(t)
    try { localStorage.setItem('va-theme', t) } catch {}
  }, [])

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      try { localStorage.setItem('va-dark', String(next)) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Remove old theme classes
    root.classList.remove('theme-default', 'theme-ocean', 'theme-slate')
    root.classList.add(`theme-${theme}`)
    // Dark mode
    root.classList.toggle('dark', isDark)
    // Apply CSS variables
    const t = THEMES[theme] || THEMES.default
    root.style.setProperty('--primary', t.primary)
    root.style.setProperty('--ring', t.ring)
    root.style.setProperty('--primary-foreground', t.primaryFg)
  }, [theme, isDark])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { theme: 'default', setTheme: () => {}, isDark: false, toggleDark: () => {}, themes: THEMES }
  return ctx
}

export { THEMES }

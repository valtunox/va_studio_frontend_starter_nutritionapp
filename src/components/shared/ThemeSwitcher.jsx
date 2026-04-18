import { useTheme, THEMES } from '@/context/ThemeContext'
import { Sun, Moon, Palette } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

function ThemeSwitcher({ position = 'bottom-right' }) {
  const { theme, setTheme, isDark, toggleDark } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-left': 'fixed bottom-6 left-6 z-50',
    'inline': 'relative',
  }

  return (
    <div ref={ref} className={positions[position] || positions['bottom-right']}>
      {open && (
        <div className="absolute bottom-14 right-0 bg-background border border-border rounded-xl shadow-xl p-3 space-y-3 min-w-[180px] animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Theme</p>
          <div className="flex gap-2">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  theme === key ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  )
}

export { ThemeSwitcher }

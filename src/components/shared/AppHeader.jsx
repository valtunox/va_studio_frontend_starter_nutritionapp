import { useState } from 'react'
import { Bell, ChevronRight, Command, Search, Sun, Moon, User, Settings, LogOut } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

function AppHeader({
  breadcrumbs = [],
  actions,
  onCommandPalette,
  notifications = 0,
  user = null,
  className,
}) {
  const { isDark, toggleDark } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className={cn(
      'sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6',
      className
    )}>
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground cursor-pointer transition-colors'}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Command Palette Trigger */}
        {onCommandPalette && (
          <button
            onClick={onCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        )}

        {/* Custom actions */}
        {actions}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-popover border border-border rounded-lg shadow-xl p-3 animate-in fade-in-0 slide-in-from-top-4 duration-200 z-50">
              <p className="text-sm font-semibold mb-2">Notifications</p>
              {notifications > 0 ? (
                <p className="text-sm text-muted-foreground">{notifications} new notification{notifications > 1 ? 's' : ''}</p>
              ) : (
                <p className="text-sm text-muted-foreground">All caught up!</p>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {(user.name || 'U').charAt(0)}
              </div>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-xl p-1 animate-in fade-in-0 slide-in-from-top-4 duration-200 z-50">
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {[
                  { icon: User, label: 'Profile' },
                  { icon: Settings, label: 'Settings' },
                  { icon: LogOut, label: 'Sign out' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export { AppHeader }

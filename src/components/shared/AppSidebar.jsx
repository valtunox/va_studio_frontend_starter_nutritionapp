import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ChevronsUpDown, LogOut, Settings, User, X, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function AppSidebar({
  brand = { icon: null, name: 'App', color: 'from-primary to-primary' },
  sections = {},
  activeItem,
  onNavigate,
  org = null,
  user = null,
  className,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const BrandIcon = brand.icon

  const filteredSections = Object.entries(sections).reduce((acc, [key, items]) => {
    if (!searchQuery) { acc[key] = items; return acc }
    const filtered = items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filtered.length) acc[key] = filtered
    return acc
  }, {})

  const sidebar = (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-background border-r border-border z-40 flex flex-col transition-all duration-200',
      collapsed ? 'w-[68px]' : 'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      className
    )}>
      {/* Brand */}
      <div className={cn('h-14 border-b border-border flex items-center shrink-0', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        <div className="flex items-center gap-2.5 min-w-0">
          {BrandIcon && (
            <div className={cn('shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center', brand.color, collapsed ? 'w-8 h-8' : 'w-8 h-8')}>
              <BrandIcon className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && <span className="font-bold text-base truncate">{brand.name}</span>}
        </div>
        <div className="flex items-center gap-1">
          {!collapsed && (
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Org Switcher */}
      {org && !collapsed && (
        <div className="px-3 py-2 border-b border-border">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{org.charAt(0)}</div>
            <span className="flex-1 text-left truncate font-medium">{org}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-transparent focus-within:border-ring focus-within:bg-background transition-colors">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm w-full outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
        {Object.entries(filteredSections).map(([section, items]) => (
          <div key={section} className="mb-2">
            {!collapsed && section !== '_' && (
              <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{section}</p>
            )}
            {items.map(({ icon: Icon, label, tab, badge, href }) => {
              const isActive = tab ? tab === activeItem : false
              return (
                <button
                  key={label}
                  onClick={() => { if (onNavigate) onNavigate(tab || label); setMobileOpen(false) }}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 w-full rounded-lg text-sm font-medium transition-colors mb-0.5',
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {Icon && <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{label}</span>
                      {badge !== undefined && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{badge}</Badge>}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className={cn('border-t border-border', collapsed ? 'p-2' : 'p-3')}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn('flex items-center gap-2.5 w-full rounded-lg hover:bg-muted transition-colors', collapsed ? 'justify-center p-2' : 'px-3 py-2')}
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {(user.name || 'U').charAt(0)}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
            {userMenuOpen && (
              <div className={cn(
                'absolute bottom-full mb-1 bg-popover border border-border rounded-md shadow-lg p-1 min-w-[160px] animate-in fade-in-0 slide-in-from-bottom-2 duration-150 z-50',
                collapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0'
              )}>
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
        </div>
      )}
    </aside>
  )

  return (
    <>
      {sidebar}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-20 lg:hidden p-2 bg-background border border-border rounded-lg shadow-sm hover:bg-muted"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className={cn('transition-all duration-200', collapsed ? 'lg:pl-[68px]' : 'lg:pl-64')}>
        {children}
      </div>
    </>
  )
}

export { AppSidebar }

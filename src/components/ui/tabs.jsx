import { cn } from '@/lib/utils'

function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 bg-muted/50 rounded-lg p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id || tab}
          onClick={() => onChange(tab.id || tab)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
            (tab.id || tab) === active
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label || tab}
          {tab.count !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function TabContent({ id, active, children, className }) {
  if (id !== active) return null
  return <div className={cn('animate-in fade-in-0 duration-200', className)}>{children}</div>
}

export { Tabs, TabContent }

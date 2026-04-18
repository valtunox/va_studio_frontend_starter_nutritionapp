import { cn } from '@/lib/utils'

function Progress({ value = 0, max = 100, size = 'md', color, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  const defaultColor = pct > 75 ? 'bg-emerald-500' : pct > 40 ? 'bg-primary' : 'bg-amber-500'

  return (
    <div className={cn('w-full rounded-full bg-muted overflow-hidden', sizes[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color || defaultColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function ProgressRing({ value = 0, max = 100, size = 48, strokeWidth = 4, color = 'stroke-primary', children, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" className={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}

export { Progress, ProgressRing }

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function Select({ value, onChange, options = [], placeholder = 'Select...', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => (o.value ?? o) === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected ? (selected.label ?? selected) : placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 slide-in-from-top-4 duration-150">
          {options.map((opt) => {
            const optValue = opt.value ?? opt
            const optLabel = opt.label ?? opt
            const isSelected = optValue === value
            return (
              <button
                key={optValue}
                type="button"
                onClick={() => { onChange(optValue); setOpen(false) }}
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent/50'
                )}
              >
                <span className="flex-1 text-left">{optLabel}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { Select }

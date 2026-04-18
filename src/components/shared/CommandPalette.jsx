import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight, Command, CornerDownLeft } from 'lucide-react'

function CommandPalette({ items = [], onSelect, isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose?.()
        else onSelect?.('__open__')
      }
      if (e.key === 'Escape' && isOpen) onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose, onSelect])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    (item.group || '').toLowerCase().includes(query.toLowerCase())
  )

  const groups = filtered.reduce((acc, item) => {
    const g = item.group || 'Actions'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[61] animate-in fade-in-0 slide-in-from-top-4 duration-200">
        <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, actions..."
              className="flex-1 py-3.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-[10px] text-muted-foreground font-mono">
              ESC
            </kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {Object.keys(groups).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
            )}
            {Object.entries(groups).map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">{group}</p>
                {groupItems.map((item) => (
                  <button
                    key={item.id || item.label}
                    onClick={() => { onSelect?.(item); onClose?.() }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left group"
                  >
                    {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                    <span className="flex-1">{item.label}</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
            <span className="flex items-center gap-1"><Command className="w-3 h-3" />K to toggle</span>
          </div>
        </div>
      </div>
    </>
  )
}

export { CommandPalette }

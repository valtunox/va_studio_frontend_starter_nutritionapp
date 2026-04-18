import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

function Tooltip({ children, content, side = 'top', className }) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef(null)

  const show = () => { clearTimeout(timeout.current); timeout.current = setTimeout(() => setVisible(true), 300) }
  const hide = () => { clearTimeout(timeout.current); setVisible(false) }

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md pointer-events-none',
            'animate-in fade-in-0 duration-150',
            sideClasses[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export { Tooltip }

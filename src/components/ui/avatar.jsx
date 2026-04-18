import { useState } from 'react'
import { cn } from '@/lib/utils'

function Avatar({ src, alt, initials, size = 'md', className }) {
  const [imgError, setImgError] = useState(false)
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' }

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt || ''}
        onError={() => setImgError(true)}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  const fallback = initials || (alt ? alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?')
  return (
    <div className={cn('rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center', sizes[size], className)}>
      {fallback}
    </div>
  )
}

export { Avatar }

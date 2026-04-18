import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * shadcn/ui utility – merges Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

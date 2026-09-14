import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

const VARIANTS = {
  // Brass is the one earned colour, so only the primary action wears it.
  primary: 'bg-brand text-brand-contrast hover:brightness-110',
  ghost: 'border-border-subtle text-content hover:bg-surface-muted border',
} as const

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-data text-data inline-flex items-center justify-center gap-2 px-3.5 py-2 font-semibold transition-[filter,background-color] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

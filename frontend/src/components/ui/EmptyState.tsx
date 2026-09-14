import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

/**
 * An empty screen is an invitation, not a placeholder — so it reads as a
 * sentence with somewhere to go, rather than a dashed box saying "no data".
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border-subtle bg-surface rounded-card flex flex-col items-start gap-2 border px-6 py-10">
      <p className="text-content text-lead font-semibold">{title}</p>
      {description && <p className="text-content-muted max-w-[52ch]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

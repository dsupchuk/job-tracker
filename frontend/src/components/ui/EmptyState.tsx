import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border-subtle flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-content text-base font-medium">{title}</p>
      {description && <p className="text-content-muted max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

import type { ApplicationStatus } from '@/api/types'
import { STATUS_META } from './statusMeta'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClass}`}>
      {meta.label}
    </span>
  )
}

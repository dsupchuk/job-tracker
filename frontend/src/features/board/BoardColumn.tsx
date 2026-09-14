import { useDroppable } from '@dnd-kit/core'
import type { Application, ApplicationStatus } from '@/api/types'
import { formatSalaryRange } from '@/features/applications/format'
import { STATUS_META } from '@/features/applications/statusMeta'
import { BoardCard } from './BoardCard'

type BoardColumnProps = {
  status: ApplicationStatus
  applications: Application[]
  onOpen: (application: Application) => void
}

/** Sum of the best-known figure per card, so the header shows what is at stake. */
function columnTotal(applications: Application[]): string {
  const total = applications.reduce(
    (sum, application) => sum + (application.salaryMax ?? application.salaryMin ?? 0),
    0,
  )
  return total === 0 ? '' : formatSalaryRange(null, total).replace('up to ', '')
}

export function BoardColumn({ status, applications, onOpen }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]
  const total = columnTotal(applications)

  return (
    <section
      ref={setNodeRef}
      aria-label={`${meta.label}, ${applications.length} applications`}
      className={`bg-surface-muted flex w-64 shrink-0 flex-col rounded-lg border p-3 transition-colors ${
        isOver ? 'border-brand' : 'border-transparent'
      }`}
    >
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClass}`}>
          {meta.label}
        </span>
        <span className="text-content-muted text-xs tabular-nums">
          {applications.length}
          {total && ` · ${total}`}
        </span>
      </header>

      <ul className="flex min-h-24 flex-col gap-2">
        {applications.map((application) => (
          <BoardCard key={application.id} application={application} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}

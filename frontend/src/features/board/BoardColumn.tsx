import { useDroppable } from '@dnd-kit/core'
import type { Application, ApplicationStatus } from '@/api/types'
import { STATUS_META } from '@/features/applications/statusMeta'
import { BoardCard } from './BoardCard'

type BoardColumnProps = {
  status: ApplicationStatus
  applications: Application[]
  onOpen: (application: Application) => void
}

export function BoardColumn({ status, applications, onOpen }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  return (
    <section
      ref={setNodeRef}
      aria-label={`${meta.label}, ${applications.length} applications`}
      className={`bg-surface-muted rounded-card flex w-64 shrink-0 flex-col border p-3 transition-colors ${
        isOver ? 'border-brand' : 'border-transparent'
      }`}
    >
      <header className="border-border-subtle mb-3 border-b pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            className={`text-data font-semibold ${
              status === 'OFFER' ? 'text-brand' : meta.out ? 'text-content-muted' : 'text-content'
            }`}
          >
            {meta.label}
          </h2>
          <span className="text-content-muted text-meta numeric">{applications.length}</span>
        </div>
      </header>

      <ul className="flex min-h-24 flex-col gap-2">
        {applications.map((application) => (
          <BoardCard key={application.id} application={application} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}

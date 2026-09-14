import { useDraggable } from '@dnd-kit/core'
import type { Application } from '@/api/types'
import { daysSince, formatSalaryRange } from '@/features/applications/format'

function ageLabel(application: Application): string | null {
  const days = daysSince(application.appliedAt)
  if (days === null) return null
  if (days <= 0) return 'applied today'
  return `${days} day${days === 1 ? '' : 's'} since applying`
}

/** The visual card, shared by the draggable item and the drag overlay. */
export function CardBody({
  application,
  dragging = false,
}: {
  application: Application
  dragging?: boolean
}) {
  const age = ageLabel(application)
  const salary = formatSalaryRange(application.salaryMin, application.salaryMax)

  return (
    <div
      className={`border-border-subtle bg-surface flex flex-col gap-1 rounded-lg border p-3 pr-9 text-left ${
        dragging ? 'shadow-lg' : ''
      }`}
    >
      <p className="text-content text-sm font-medium">{application.position}</p>
      {application.company && <p className="text-content-muted text-xs">{application.company}</p>}
      {salary && <p className="text-content-muted text-xs tabular-nums">{salary}</p>}
      {age && <p className="text-content-muted text-xs">{age}</p>}
    </div>
  )
}

type BoardCardProps = {
  application: Application
  onOpen: (application: Application) => void
}

/**
 * Plain draggable, not sortable: position within a column is derived, not
 * stored, so there is no reorder to offer. A card only ever changes column.
 *
 * The drag handle and the details button are siblings, never nested — dnd-kit
 * puts `role="button"` on the handle, and a control inside that would be
 * unreachable for assistive technology.
 */
export function BoardCard({ application, onOpen }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: application.id })

  return (
    <li className={`relative ${isDragging ? 'opacity-40' : ''}`}>
      <div
        ref={setNodeRef}
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <CardBody application={application} />
      </div>

      <button
        type="button"
        onClick={() => onOpen(application)}
        className="text-content-muted hover:text-content absolute top-2 right-2 rounded px-1 text-xs"
      >
        <span aria-hidden="true">ⓘ</span>
        <span className="sr-only">Details for {application.position}</span>
      </button>
    </li>
  )
}

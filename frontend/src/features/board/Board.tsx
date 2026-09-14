import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/api/types'
import { STATUS_META } from '@/features/applications/statusMeta'
import { boardCoordinateGetter } from './boardKeyboard'
import { BoardColumn } from './BoardColumn'
import { CardBody } from './BoardCard'
import { sortColumn } from './columnOrder'
import { useStatusMutation } from './useStatusMutation'

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Press space or enter to pick up the application. ' +
    'Use the left and right arrows to move it between columns. ' +
    'Press space or enter again to drop it, or escape to cancel.',
}

function isStatus(value: unknown): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}

type BoardProps = {
  applications: Application[]
  onOpen: (application: Application) => void
}

export function Board({ applications, onOpen }: BoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const statusMutation = useStatusMutation()

  const sensors = useSensors(
    // A small threshold so clicking the details button never starts a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: boardCoordinateGetter }),
  )

  const byStatus = useMemo(() => {
    const groups = new Map<ApplicationStatus, Application[]>(
      APPLICATION_STATUSES.map((status) => [status, []]),
    )
    for (const application of applications) {
      groups.get(application.status)?.push(application)
    }
    for (const [status, group] of groups) {
      groups.set(status, sortColumn(group))
    }
    return groups
  }, [applications])

  const activeApplication = applications.find((application) => application.id === activeId) ?? null

  /** Cards are plain draggables, so the drop target is always a column. */
  function resolveStatus(overId: UniqueIdentifier | undefined): ApplicationStatus | null {
    return overId !== undefined && isStatus(overId) ? overId : null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)

    const id = Number(event.active.id)
    const target = resolveStatus(event.over?.id)
    const current = applications.find((application) => application.id === id)

    // Reordering inside a column carries no meaning here — only moves do.
    if (!target || !current || current.status === target) return
    statusMutation.mutate({ id, status: target })
  }

  const announcements = useMemo<Announcements>(() => {
    const nameOf = (id: UniqueIdentifier) =>
      applications.find((application) => application.id === Number(id))?.position ?? 'application'
    const columnOf = (id: UniqueIdentifier | undefined) =>
      id !== undefined && isStatus(id) ? STATUS_META[id].label : null

    return {
      onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
      onDragOver: ({ active, over }) => {
        const column = columnOf(over?.id)
        return column ? `${nameOf(active.id)} is over ${column}.` : undefined
      },
      onDragEnd: ({ active, over }) => {
        const column = columnOf(over?.id)
        return column
          ? `Moved ${nameOf(active.id)} to ${column}.`
          : `${nameOf(active.id)} was dropped outside a column.`
      },
      onDragCancel: ({ active }) => `Cancelled moving ${nameOf(active.id)}.`,
    }
  }, [applications])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{ announcements, screenReaderInstructions }}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {APPLICATION_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            applications={byStatus.get(status) ?? []}
            onOpen={onOpen}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication && <CardBody application={activeApplication} dragging />}
      </DragOverlay>
    </DndContext>
  )
}

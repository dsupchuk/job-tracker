import { KeyboardCode, type KeyboardCoordinateGetter } from '@dnd-kit/core'
import { APPLICATION_STATUSES } from '@/api/types'

/**
 * Keyboard movement for the board: left and right jump whole columns.
 *
 * The library's default getter nudges by a fixed pixel step and has no notion
 * of a board, so a card could not be moved across one with the keyboard. Up and
 * down do nothing on purpose — order within a column is derived rather than
 * stored, so there is nothing for them to change.
 */
export const boardCoordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { collisionRect, droppableRects } = context

  const isHorizontal = event.code === KeyboardCode.Left || event.code === KeyboardCode.Right
  if (!isHorizontal || !collisionRect) return undefined

  const columns = APPLICATION_STATUSES.map((status) => droppableRects.get(status)).filter(
    (rect) => rect !== undefined,
  )
  if (columns.length === 0) return undefined

  // Which column is the card over right now? Compare on its horizontal centre.
  const centre = collisionRect.left + collisionRect.width / 2
  const currentIndex = columns.findIndex(
    (rect) => centre >= rect.left && centre <= rect.left + rect.width,
  )

  const step = event.code === KeyboardCode.Right ? 1 : -1
  const from = currentIndex === -1 ? (step > 0 ? -1 : columns.length) : currentIndex
  const target = columns[Math.min(Math.max(from + step, 0), columns.length - 1)]
  if (!target) return undefined

  return { x: target.left + target.width / 2 - collisionRect.width / 2, y: collisionRect.top }
}

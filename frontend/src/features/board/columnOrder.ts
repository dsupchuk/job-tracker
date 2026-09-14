import type { Application } from '@/api/types'

/**
 * Order within a column: whatever has been waiting longest sits at the top.
 *
 * Card order is not stored — the data model has no notion of it — so the board
 * derives one instead of exposing a reorder that would silently snap back on
 * the next refetch. Applications with no applied date (still `SAVED`) sort after
 * the rest, oldest first by id.
 */
export function sortColumn(applications: Application[]): Application[] {
  return [...applications].sort((a, b) => {
    if (a.appliedAt !== b.appliedAt) {
      if (a.appliedAt === null) return 1
      if (b.appliedAt === null) return -1
      return a.appliedAt.localeCompare(b.appliedAt)
    }
    return a.id - b.id
  })
}

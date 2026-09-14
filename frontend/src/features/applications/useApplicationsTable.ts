import { useTable, type ColumnFiltersState, type SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { Application } from '@/api/types'
import { useAppSelector } from '@/store/hooks'
import { applicationColumns, applicationTableFeatures } from './tableConfig'

/**
 * Owns the table instance. Search and status filters come from `uiSlice` so
 * they survive navigation; sort order is view-local and resets with the page.
 */
export function useApplicationsTable(data: Application[]) {
  const search = useAppSelector((state) => state.ui.search)
  const statusFilter = useAppSelector((state) => state.ui.statusFilter)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'appliedAt', desc: true }])

  const columnFilters = useMemo<ColumnFiltersState>(
    () => (statusFilter.length > 0 ? [{ id: 'status', value: statusFilter }] : []),
    [statusFilter],
  )

  const table = useTable({
    features: applicationTableFeatures,
    data,
    columns: applicationColumns,
    state: { sorting, columnFilters, globalFilter: search },
    onSortingChange: setSorting,
    globalFilterFn: 'includesString',
  })

  const rows = table.getRowModel().rows

  return {
    table,
    /** Exactly what the table shows right now — what CSV export writes out. */
    visibleRows: rows.map((row) => row.original),
  }
}

export type ApplicationsTableInstance = ReturnType<typeof useApplicationsTable>['table']

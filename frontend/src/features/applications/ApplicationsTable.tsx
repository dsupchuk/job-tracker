import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { Application } from '@/api/types'
import { applicationColumns } from './tableConfig'
import type { ApplicationsTableInstance } from './useApplicationsTable'

const ROW_HEIGHT = 52

/** Fixed layout keeps columns aligned while rows are virtualised. */
const COLUMN_WIDTHS: Record<string, string> = {
  position: 'w-[21%]',
  company: 'w-[13%]',
  status: 'w-[10%]',
  appliedAt: 'w-[12%]',
  salary: 'w-[16%]',
  techStack: 'w-[20%]',
  sourceUrl: 'w-[8%]',
}

const SORT_LABEL = { asc: '▲', desc: '▼' } as const

type ApplicationsTableProps = {
  table: ApplicationsTableInstance
  onRowSelect: (application: Application) => void
}

export function ApplicationsTable({ table, onRowSelect }: ApplicationsTableProps) {
  const rows = table.getRowModel().rows

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const paddingTop = virtualRows[0]?.start ?? 0
  const paddingBottom = virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)

  return (
    <div
      ref={scrollRef}
      className="border-border-subtle h-[68vh] overflow-auto rounded-lg border"
      role="region"
      aria-label="Applications"
      tabIndex={0}
    >
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead className="bg-surface-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      sorted
                        ? sorted === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : canSort
                          ? 'none'
                          : undefined
                    }
                    className={`border-border-subtle text-content-muted border-b px-4 py-2 text-xs font-semibold ${COLUMN_WIDTHS[header.column.id] ?? ''}`}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:text-content inline-flex items-center gap-1"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span aria-hidden="true">{sorted ? SORT_LABEL[sorted] : '↕'}</span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {paddingTop > 0 && (
            <tr aria-hidden="true">
              <td colSpan={applicationColumns.length} style={{ height: paddingTop }} />
            </tr>
          )}

          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null
            return (
              <tr
                key={row.id}
                onClick={() => onRowSelect(row.original)}
                className="border-border-subtle hover:bg-surface-muted cursor-pointer border-b"
                style={{ height: ROW_HEIGHT }}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="truncate px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}

          {paddingBottom > 0 && (
            <tr aria-hidden="true">
              <td colSpan={applicationColumns.length} style={{ height: paddingBottom }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

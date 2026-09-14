import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { applicationColumns } from './tableConfig'
import type { ApplicationsTableInstance } from './useApplicationsTable'

const ROW_HEIGHT = 60

/** Fixed layout keeps columns aligned while rows are virtualised. */
const COLUMN_WIDTHS: Record<string, string> = {
  position: 'w-[20%]',
  company: 'w-[13%]',
  status: 'w-[15%]',
  appliedAt: 'w-[13%]',
  salary: 'w-[15%]',
  techStack: 'w-[17%]',
  sourceUrl: 'w-[7%]',
}

const SORT_LABEL = { asc: '↑', desc: '↓' } as const

type ApplicationsTableProps = {
  table: ApplicationsTableInstance
}

export function ApplicationsTable({ table }: ApplicationsTableProps) {
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
      className="border-border-subtle bg-surface rounded-card h-[68vh] overflow-auto border"
      role="region"
      aria-label="Applications"
      tabIndex={0}
    >
      {/* A data table cannot usefully shrink to a phone: seven columns at 390px
          leave two characters each. It keeps its readable width and the region
          scrolls sideways instead. */}
      <table className="w-full min-w-[56rem] table-fixed border-collapse text-left">
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
                    className={`border-border-subtle text-content-muted text-meta border-b px-4 py-2.5 font-semibold ${COLUMN_WIDTHS[header.column.id] ?? ''}`}
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
                className="border-border-subtle hover:bg-ground border-b"
                style={{ height: ROW_HEIGHT }}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="truncate px-4 py-2 align-middle">
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

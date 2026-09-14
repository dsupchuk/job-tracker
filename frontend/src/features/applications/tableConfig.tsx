import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type FilterFn,
  type TableFeatures,
} from '@tanstack/react-table'
import type { Application } from '@/api/types'
import { formatDate, formatSalaryRange } from './format'
import { StatusBadge } from './StatusBadge'

/**
 * Keeps rows whose cell value appears in the selected set. The built-in
 * `arrIncludesSome` expects the *cell* to hold an array; here the cell is a
 * single status and the filter value is the list of selected ones.
 */
const filterFn_oneOf: FilterFn<TableFeatures, Application> = (row, columnId, filterValue) =>
  !Array.isArray(filterValue) || filterValue.length === 0
    ? true
    : filterValue.includes(row.getValue(columnId))

/**
 * Only the features this table actually uses are registered, so the rest stays
 * out of the bundle. Declared at module scope — recreating it per render would
 * rebuild the table instance on every pass.
 */
export const applicationTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { ...filterFns, oneOf: filterFn_oneOf },
  sortFns,
})

export type ApplicationTableFeatures = typeof applicationTableFeatures

const helper = createColumnHelper<ApplicationTableFeatures, Application>()

// `helper.columns` preserves each column's own value type; a plain array would
// widen them all to `unknown` and break the cell contexts.
export const applicationColumns = helper.columns([
  helper.accessor('position', {
    header: 'Position',
    enableGlobalFilter: true,
    cell: (info) => <span className="text-content font-medium">{info.getValue()}</span>,
  }),
  helper.accessor('company', {
    header: 'Company',
    enableGlobalFilter: true,
    sortUndefined: 'last',
    cell: (info) => <span className="text-content-muted">{info.getValue()}</span>,
  }),
  helper.accessor('status', {
    header: 'Status',
    enableGlobalFilter: false,
    // The status filter holds an array of selected statuses.
    filterFn: 'oneOf',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  helper.accessor('appliedAt', {
    header: 'Applied',
    enableGlobalFilter: false,
    // ISO dates sort chronologically as plain strings; nulls sort last.
    sortUndefined: 'last',
    cell: (info) => <span className="text-content-muted">{formatDate(info.getValue())}</span>,
  }),
  helper.accessor((row) => row.salaryMax ?? row.salaryMin, {
    id: 'salary',
    header: 'Salary',
    enableGlobalFilter: false,
    sortUndefined: 'last',
    cell: (info) => (
      <span className="text-content-muted tabular-nums">
        {formatSalaryRange(info.row.original.salaryMin, info.row.original.salaryMax)}
      </span>
    ),
  }),
  helper.accessor('techStack', {
    header: 'Tech stack',
    enableGlobalFilter: true,
    enableSorting: false,
    cell: (info) => <span className="text-content-muted">{info.getValue()}</span>,
  }),
  helper.accessor('sourceUrl', {
    header: 'Source',
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (info) => {
      const url = info.getValue()
      if (!url) return null
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-brand underline underline-offset-4"
        >
          Posting
        </a>
      )
    },
  }),
])

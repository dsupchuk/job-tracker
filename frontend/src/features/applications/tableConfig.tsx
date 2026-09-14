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
import { AgeMeter } from './AgeMeter'
import { formatDate, formatSalaryRange } from './format'
import { StageIndicator } from './StageIndicator'

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
  // Opening a record is a row action, and the cell that renders it needs a way
  // to reach the handler the page owns.
  tableMeta: {} as { openApplication: (application: Application) => void },
})

export type ApplicationTableFeatures = typeof applicationTableFeatures

const helper = createColumnHelper<ApplicationTableFeatures, Application>()

// `helper.columns` preserves each column's own value type; a plain array would
// widen them all to `unknown` and break the cell contexts.
export const applicationColumns = helper.columns([
  helper.accessor('position', {
    header: 'Position',
    enableGlobalFilter: true,
    // A real button, not a click handler on the row: a `<tr>` cannot be focused,
    // so a row-level onClick makes opening a record mouse-only.
    cell: (info) => (
      <button
        type="button"
        onClick={() => info.table.options.meta?.openApplication(info.row.original)}
        className="text-content text-data hover:text-brand text-left font-semibold"
      >
        {info.getValue()}
        <span className="sr-only"> — open this application</span>
      </button>
    ),
  }),
  helper.accessor('company', {
    header: 'Company',
    enableGlobalFilter: true,
    sortUndefined: 'last',
    cell: (info) => <span className="text-content text-data">{info.getValue()}</span>,
  }),
  helper.accessor('status', {
    header: 'Status',
    enableGlobalFilter: false,
    // The status filter holds an array of selected statuses.
    filterFn: 'oneOf',
    cell: (info) => <StageIndicator status={info.getValue()} />,
  }),
  helper.accessor('appliedAt', {
    header: 'Waiting',
    enableGlobalFilter: false,
    // ISO dates sort chronologically as plain strings; nulls sort last.
    sortUndefined: 'last',
    cell: (info) => {
      const appliedAt = info.getValue()
      if (!appliedAt) return <span className="text-content-muted text-meta">not sent</span>
      return (
        <span className="flex flex-col gap-1">
          <AgeMeter appliedAt={appliedAt} />
          <span className="text-content-muted text-meta numeric">{formatDate(appliedAt)}</span>
        </span>
      )
    },
  }),
  helper.accessor((row) => row.salaryMax ?? row.salaryMin, {
    id: 'salary',
    header: 'Salary',
    enableGlobalFilter: false,
    sortUndefined: 'last',
    cell: (info) => (
      <span className="text-content text-data numeric">
        {formatSalaryRange(info.row.original.salaryMin, info.row.original.salaryMax)}
      </span>
    ),
  }),
  helper.accessor('techStack', {
    header: 'Tech stack',
    enableGlobalFilter: true,
    enableSorting: false,
    cell: (info) => <span className="text-content-muted text-data">{info.getValue()}</span>,
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

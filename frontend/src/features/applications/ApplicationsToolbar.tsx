import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { filtersCleared, searchChanged, statusFilterChanged } from '@/store/uiSlice'
import { downloadCsv } from './exportCsv'
import { STATUS_META } from './statusMeta'

type ApplicationsToolbarProps = {
  visibleRows: Application[]
  onCreate: () => void
}

export function ApplicationsToolbar({ visibleRows, onCreate }: ApplicationsToolbarProps) {
  const search = useAppSelector((state) => state.ui.search)
  const statusFilter = useAppSelector((state) => state.ui.statusFilter)
  const dispatch = useAppDispatch()

  const hasFilters = search !== '' || statusFilter.length > 0

  function toggleStatus(status: ApplicationStatus) {
    const next = statusFilter.includes(status)
      ? statusFilter.filter((value) => value !== status)
      : [...statusFilter, status]
    dispatch(statusFilterChanged(next))
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="applications-search">
        Search applications
      </label>
      <input
        id="applications-search"
        type="search"
        value={search}
        onChange={(event) => dispatch(searchChanged(event.target.value))}
        placeholder="Search position, company or tech stack…"
        className="border-border-subtle bg-surface text-content placeholder:text-content-muted w-72 rounded-md border px-3 py-2 text-sm"
      />

      <fieldset className="flex flex-wrap items-center gap-1.5">
        <legend className="sr-only">Filter by status</legend>
        {APPLICATION_STATUSES.map((status) => {
          const active = statusFilter.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => toggleStatus(status)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? 'border-brand bg-brand text-brand-contrast'
                  : 'border-border-subtle text-content-muted hover:bg-surface-muted'
              }`}
            >
              {STATUS_META[status].label}
            </button>
          )
        })}
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          onClick={() => dispatch(filtersCleared())}
          className="text-content-muted hover:text-content text-xs underline underline-offset-4"
        >
          Clear filters
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-content-muted text-xs">{visibleRows.length} shown</span>
        <Button
          variant="ghost"
          onClick={() => downloadCsv(visibleRows)}
          disabled={visibleRows.length === 0}
        >
          Export CSV
        </Button>
        <Button onClick={onCreate}>New application</Button>
      </div>
    </div>
  )
}

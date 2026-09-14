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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <label className="sr-only" htmlFor="applications-search">
        Search applications
      </label>
      <input
        id="applications-search"
        type="search"
        value={search}
        onChange={(event) => dispatch(searchChanged(event.target.value))}
        placeholder="Search position, company or tech stack"
        className="border-border-subtle bg-surface text-content placeholder:text-content-muted rounded-data text-data w-full border px-3 py-2 sm:w-72"
      />

      {/* The filter reads as one control: stages in funnel order, selection
          shown by weight rather than by giving each status its own colour.
          Six stages do not fit a phone, so the strip scrolls rather than
          pushing the whole page sideways. */}
      {/* `min-w-0` is load-bearing: a flex item defaults to `min-width: auto`,
          so without it the strip refuses to shrink and pushes the page wider
          than the screen instead of scrolling inside itself. */}
      <fieldset className="border-border-subtle bg-surface rounded-data flex min-w-0 items-center overflow-x-auto border">
        <legend className="sr-only">Filter by stage</legend>
        {APPLICATION_STATUSES.map((status) => {
          const active = statusFilter.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => toggleStatus(status)}
              className={`text-meta border-border-subtle shrink-0 px-2.5 py-2 font-semibold first:rounded-l-[3px] last:rounded-r-[3px] not-first:border-l ${
                active ? 'bg-content text-surface' : 'text-content-muted hover:bg-surface-muted'
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
          className="text-content-muted hover:text-content text-meta underline underline-offset-4"
        >
          Clear filters
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-content-muted text-meta numeric">{visibleRows.length} shown</span>
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

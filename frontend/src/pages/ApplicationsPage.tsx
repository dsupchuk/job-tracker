import { useQuery } from '@tanstack/react-query'
import { applicationKeys, listApplications } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'

const PAGE_PARAMS = { page: 0, size: 20, sort: 'createdAt,desc' }

/**
 * Placeholder list proving the API wiring end to end. Phase 4 replaces it with
 * the TanStack Table implementation.
 */
export function ApplicationsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: applicationKeys.list(PAGE_PARAMS),
    queryFn: () => listApplications(PAGE_PARAMS),
  })

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-lg font-semibold">Applications</h1>

      {isPending && <SkeletonRows />}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {apiErrorMessage(error, 'Could not load applications')}
        </p>
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="Applications you track will show up here."
        />
      )}

      {data && data.content.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.content.map((application) => (
            <li
              key={application.id}
              className="border-border-subtle flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <span className="text-content text-sm font-medium">{application.position}</span>
              <span className="border-border-subtle text-content-muted rounded-full border px-2 py-0.5 text-xs">
                {application.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <p className="text-content-muted text-xs">
          {data.totalElements} total · page {data.number + 1} of {Math.max(data.totalPages, 1)}
        </p>
      )}
    </section>
  )
}

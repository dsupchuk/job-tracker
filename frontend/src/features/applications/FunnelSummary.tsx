import { useQuery } from '@tanstack/react-query'
import { applicationKeys, listAllApplications } from '@/api/applications'
import { APPLICATION_STATUSES } from '@/api/types'
import { STATUS_META } from './statusMeta'

/**
 * Where everything stands, in the space the navigation was wasting. Bars are
 * proportional to the largest stage rather than to the total, so small stages
 * stay legible instead of collapsing to a sliver.
 */
export function FunnelSummary() {
  const { data } = useQuery({
    queryKey: applicationKeys.listAll(),
    queryFn: listAllApplications,
  })

  if (!data || data.length === 0) return null

  const counts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: data.filter((application) => application.status === status).length,
  }))
  const largest = Math.max(...counts.map((entry) => entry.count), 1)

  return (
    <section aria-labelledby="funnel-heading" className="mt-8 px-2">
      <h2 id="funnel-heading" className="text-content-muted text-meta font-semibold">
        Where things stand
      </h2>

      <dl className="mt-3 flex flex-col gap-2">
        {counts.map(({ status, count }) => (
          <div key={status} className="flex items-center gap-2">
            <dt className="text-content-muted text-meta w-16 shrink-0">
              {STATUS_META[status].label}
            </dt>
            <div className="bg-surface-muted rounded-data h-1.5 flex-1 overflow-hidden">
              <div
                className={`h-full ${status === 'OFFER' ? 'bg-brand' : 'bg-content-muted'}`}
                style={{ width: `${(count / largest) * 100}%` }}
              />
            </div>
            <dd className="text-content text-meta numeric w-4 text-right font-semibold">{count}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

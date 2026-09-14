import { useQuery } from '@tanstack/react-query'
import { applicationKeys, getStatusHistory } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { STATUS_META } from '@/features/applications/statusMeta'

const WHEN = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function StatusTimeline({ applicationId }: { applicationId: number }) {
  const { data, isPending, error } = useQuery({
    queryKey: applicationKeys.history(applicationId),
    queryFn: () => getStatusHistory(applicationId),
  })

  if (isPending) return <SkeletonRows rows={3} />

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-500">
        {apiErrorMessage(error, 'Could not load the timeline')}
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-3">
      {data.map((entry) => (
        <li key={entry.id} className="flex items-baseline gap-3">
          <span className="text-content-muted w-40 shrink-0 text-xs tabular-nums">
            {WHEN.format(new Date(entry.changedAt))}
          </span>
          <span className="text-content text-sm">
            {entry.fromStatus ? (
              <>
                {STATUS_META[entry.fromStatus].label} → {STATUS_META[entry.toStatus].label}
              </>
            ) : (
              <>Created as {STATUS_META[entry.toStatus].label}</>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { applicationKeys, listAllApplications } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import type { Application } from '@/api/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ApplicationDetailDialog } from '@/features/board/ApplicationDetailDialog'
import { Board } from '@/features/board/Board'

export function BoardPage() {
  const { data, isPending, error } = useQuery({
    queryKey: applicationKeys.listAll(),
    queryFn: listAllApplications,
  })
  const [detail, setDetail] = useState<Application | null>(null)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-lg font-semibold">Board</h1>

      {isPending && <SkeletonRows rows={5} />}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {apiErrorMessage(error, 'Could not load the board')}
        </p>
      )}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            title="Nothing to track yet"
            description="Add an application on the Applications page to see it here."
          />
        ) : (
          <Board applications={data} onOpen={setDetail} />
        ))}

      <ApplicationDetailDialog application={detail} onClose={() => setDetail(null)} />
    </section>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { applicationKeys, listAllApplications } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import type { Application } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ApplicationFormDialog } from '@/features/applications/ApplicationFormDialog'
import { ApplicationsTable } from '@/features/applications/ApplicationsTable'
import { ApplicationsToolbar } from '@/features/applications/ApplicationsToolbar'
import { useApplicationsTable } from '@/features/applications/useApplicationsTable'

const NO_ROWS: Application[] = []

/** `null` means create mode; `false` means the dialog is closed. */
type DialogState = Application | null | false

export function ApplicationsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: applicationKeys.listAll(),
    queryFn: listAllApplications,
  })
  const [dialog, setDialog] = useState<DialogState>(false)

  const applications = data ?? NO_ROWS
  const { table, visibleRows } = useApplicationsTable(applications, setDialog)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-title font-semibold tracking-tight">Applications</h1>

      {isPending && <SkeletonRows rows={8} />}

      {error && (
        <p role="alert" className="text-danger text-data">
          {apiErrorMessage(error, 'Could not load applications')}
        </p>
      )}

      {data && (
        <>
          <ApplicationsToolbar visibleRows={visibleRows} onCreate={() => setDialog(null)} />

          {applications.length === 0 ? (
            <EmptyState
              title="Start tracking your search"
              description="Add the first application and this table fills in — stage, salary range, and how long each one has been waiting on a reply."
              action={<Button onClick={() => setDialog(null)}>New application</Button>}
            />
          ) : visibleRows.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              description="Widen the search or clear the stage filter to see the rest."
            />
          ) : (
            <ApplicationsTable table={table} />
          )}
        </>
      )}

      <ApplicationFormDialog
        open={dialog !== false}
        application={dialog === false ? null : dialog}
        applications={applications}
        onClose={() => setDialog(false)}
      />
    </section>
  )
}

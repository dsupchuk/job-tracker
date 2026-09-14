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
  const { table, visibleRows } = useApplicationsTable(applications)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-lg font-semibold">Applications</h1>

      {isPending && <SkeletonRows rows={8} />}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {apiErrorMessage(error, 'Could not load applications')}
        </p>
      )}

      {data && (
        <>
          <ApplicationsToolbar visibleRows={visibleRows} onCreate={() => setDialog(null)} />

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Add the first one to start tracking."
              action={<Button onClick={() => setDialog(null)}>New application</Button>}
            />
          ) : visibleRows.length === 0 ? (
            <EmptyState
              title="No matches"
              description="No application matches the current filters."
            />
          ) : (
            <ApplicationsTable table={table} onRowSelect={setDialog} />
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

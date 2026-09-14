import { useEffect, useRef } from 'react'
import type { Application } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { formatDate, formatSalaryRange } from '@/features/applications/format'
import { StageIndicator } from '@/features/applications/StageIndicator'
import { StatusTimeline } from './StatusTimeline'

type ApplicationDetailDialogProps = {
  application: Application | null
  onClose: () => void
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-content-muted text-meta">{label}</dt>
      <dd className="text-content text-data">{value}</dd>
    </div>
  )
}

/** Read-only card detail with the status timeline. Editing lives in the table. */
export function ApplicationDetailDialog({ application, onClose }: ApplicationDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (application && !dialog.open) dialog.showModal()
    if (!application && dialog.open) dialog.close()
  }, [application])

  if (!application) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="detail-dialog-title"
      // Radius and clip here, scrolling on the inner box — a scrollbar drawn on
      // the rounded element itself squares off the corners it overlaps.
      className="bg-surface text-content border-border-subtle rounded-overlay m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden border p-0 backdrop:bg-black/40"
    >
      <div className="max-h-[90dvh] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="detail-dialog-title"
              className="text-content text-lead font-semibold tracking-tight"
            >
              {application.position}
            </h2>
            {application.company && (
              <p className="text-content-muted text-data">{application.company}</p>
            )}
          </div>
          <StageIndicator status={application.status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Detail label="Applied" value={formatDate(application.appliedAt)} />
          <Detail label="Deadline" value={formatDate(application.deadline)} />
          <Detail
            label="Salary"
            value={formatSalaryRange(application.salaryMin, application.salaryMax) || null}
          />
          <Detail label="Tech stack" value={application.techStack} />
        </dl>

        {application.sourceUrl && (
          <a
            href={application.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand text-data mt-4 inline-block underline underline-offset-4"
          >
            Open the job posting
          </a>
        )}

        <h3 className="text-content text-data mt-6 mb-3 font-semibold">Status timeline</h3>
        <StatusTimeline applicationId={application.id} />

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  )
}

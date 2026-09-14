import { useEffect, useRef } from 'react'
import type { Application } from '@/api/types'
import { SchemaForm } from '@/features/form-engine/SchemaForm'
import type { FormValues } from '@/features/form-engine/types'
import { applicationFormSchema, toFormValues, toRequest } from './applicationFormSchema'
import { useApplicationMutations } from './useApplicationMutations'

type ApplicationFormDialogProps = {
  open: boolean
  /** `null` opens the dialog in create mode. */
  application: Application | null
  /** Everything currently cached — the duplicate-position check reads it. */
  applications: Application[]
  onClose: () => void
}

/**
 * A native `<dialog>` rather than a hand-rolled overlay: the platform gives us
 * the focus trap, Escape handling and inertness of the page behind it.
 */
export function ApplicationFormDialog({
  open,
  application,
  applications,
  onClose,
}: ApplicationFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { create, update, remove } = useApplicationMutations()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  if (!open) return null

  const isEdit = application !== null
  const pending = create.isPending || update.isPending || remove.isPending

  function handleSubmit(values: FormValues) {
    const body = toRequest(values)
    const action = application
      ? update.mutateAsync({ id: application.id, body })
      : create.mutateAsync(body)

    // Only close on success: a rejected save must keep the user's input on
    // screen so they can act on the error the toast reports.
    void action.then(onClose).catch(() => undefined)
  }

  function handleDelete() {
    if (!application) return
    void remove
      .mutateAsync(application.id)
      .then(onClose)
      .catch(() => undefined)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="application-dialog-title"
      className="bg-surface text-content border-border-subtle m-auto w-full max-w-xl rounded-xl border p-6 backdrop:bg-black/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="application-dialog-title" className="text-content text-base font-semibold">
          {isEdit ? 'Edit application' : 'New application'}
        </h2>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-xs text-red-500 underline underline-offset-4 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>

      <SchemaForm
        // Remounts the form when switching between records so defaults reload.
        key={application?.id ?? 'new'}
        schema={applicationFormSchema}
        defaultValues={toFormValues(application)}
        submitLabel={isEdit ? 'Save changes' : 'Create application'}
        pending={pending}
        onSubmit={handleSubmit}
        onCancel={onClose}
        validationContext={{ applications, currentId: application?.id ?? null }}
      />
    </dialog>
  )
}

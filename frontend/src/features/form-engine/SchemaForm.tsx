import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Controller, useForm, type Control, type Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { buildZodSchema } from './buildZodSchema'
import { fieldRegistry } from './fieldRegistry'
import {
  allFields,
  type FieldSchema,
  type FormSchema,
  type FormValues,
  type ValidationContext,
} from './types'
import { isFieldVisible, visibleFields } from './visibility'

type SchemaFormProps = {
  schema: FormSchema
  defaultValues: FormValues
  submitLabel: string
  onSubmit: (values: FormValues) => void
  onCancel?: () => void
  pending?: boolean
  errorMessage?: string | undefined
  validationContext?: ValidationContext
}

type FieldRowProps = {
  field: FieldSchema
  control: Control<FormValues>
}

function FieldRow({ field, control }: FieldRowProps) {
  const inputId = useId()
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`
  const Component = fieldRegistry[field.type]

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controlled, fieldState }) => {
        const error = fieldState.error?.message
        const describedBy =
          [field.help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') ||
          undefined

        return (
          <div className="flex flex-col gap-1.5">
            {/* The marker sits outside the label so the label's text stays
                exactly the field name — `aria-required` carries the meaning. */}
            <div className="flex items-center gap-1">
              <label htmlFor={inputId} className="text-content text-data font-semibold">
                {field.label}
              </label>
              {field.required && (
                <span className="text-danger" aria-hidden="true">
                  *
                </span>
              )}
            </div>

            <Component
              field={field}
              value={controlled.value}
              onChange={controlled.onChange}
              onBlur={controlled.onBlur}
              inputId={inputId}
              describedBy={describedBy}
              invalid={error !== undefined}
            />

            {field.help && (
              <p id={helpId} className="text-content-muted text-meta">
                {field.help}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-danger text-data">
                {error}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

/**
 * Walks a schema and renders it. The renderer knows nothing about individual
 * field types — it looks them up in `fieldRegistry` — and nothing about the
 * validation rules, which `buildZodSchema` derives from the same schema.
 */
export function SchemaForm({
  schema,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  pending = false,
  errorMessage,
  validationContext,
}: SchemaFormProps) {
  const fields = useMemo(() => allFields(schema), [schema])

  // Read through a ref so the resolver identity stays stable across renders.
  const contextRef = useRef(validationContext)
  contextRef.current = validationContext

  /**
   * The schema is rebuilt per validation run from the fields visible for the
   * values being validated. A hidden field therefore cannot fail validation,
   * and its value is stripped from the parsed result.
   */
  const resolver = useCallback<Resolver<FormValues>>(
    (values, context, options) =>
      zodResolver(buildZodSchema(visibleFields(fields, values), contextRef.current ?? {}))(
        values,
        context,
        options,
      ),
    [fields],
  )

  const form = useForm<FormValues>({ defaultValues, resolver, mode: 'onTouched' })
  const values = form.watch()

  const hiddenNames = fields
    .filter((field) => !isFieldVisible(field, values))
    .map((field) => field.name)
  const hiddenKey = hiddenNames.join('|')

  useEffect(() => {
    if (hiddenKey === '') return
    // Keep form state in step with what is on screen.
    form.unregister(hiddenKey.split('|'), { keepDefaultValue: true })
  }, [hiddenKey, form])

  /**
   * Re-runs validation for fields whose rule depends on another field, but only
   * while they are actually showing an error — otherwise editing one field
   * would surface errors on untouched ones.
   */
  const revalidationKey = fields
    .filter((field) => field.revalidateOn?.length)
    .map((field) => `${field.name}:${field.revalidateOn?.map((dep) => String(values[dep])).join()}`)
    .join('|')

  const staleErrors = useRef<string[]>([])
  staleErrors.current = fields
    .filter((field) => field.revalidateOn?.length && form.formState.errors[field.name])
    .map((field) => field.name)

  useEffect(() => {
    if (staleErrors.current.length > 0) void form.trigger(staleErrors.current)
  }, [revalidationKey, form])

  const isWizard = schema.mode === 'wizard' && schema.steps.length > 1
  const [stepIndex, setStepIndex] = useState(0)
  const steps = schema.steps
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)]
  const isLastStep = stepIndex === steps.length - 1

  async function goToNextStep() {
    const names = (currentStep?.fields ?? [])
      .filter((field) => isFieldVisible(field, values))
      .map((field) => field.name)

    // Per-step validation: advancing must not skip the current step's rules.
    if (await form.trigger(names)) setStepIndex((index) => index + 1)
  }

  const renderedSteps = isWizard ? (currentStep ? [currentStep] : []) : steps

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {isWizard && (
        <p className="text-content-muted text-meta" aria-live="polite">
          Step {stepIndex + 1} of {steps.length} — {currentStep?.title}
        </p>
      )}

      {renderedSteps.map((step) => (
        <fieldset key={step.id} className="flex flex-col gap-4">
          {!isWizard && steps.length > 1 && (
            <legend className="text-content text-data font-semibold">{step.title}</legend>
          )}
          {step.description && <p className="text-content-muted text-meta">{step.description}</p>}

          {step.fields
            .filter((field) => isFieldVisible(field, values))
            .map((field) => (
              <FieldRow key={field.name} field={field} control={form.control} />
            ))}
        </fieldset>
      ))}

      {errorMessage && (
        <p role="alert" className="text-danger text-data">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}

        {isWizard && stepIndex > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStepIndex((i) => i - 1)}>
            Back
          </Button>
        )}

        {isWizard && !isLastStep ? (
          <Button type="button" onClick={goToNextStep}>
            Next
          </Button>
        ) : (
          // Deliberately not disabled while validating: async rules re-run on
          // every keystroke, and a flickering submit button swallows clicks.
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
        )}
      </div>
    </form>
  )
}

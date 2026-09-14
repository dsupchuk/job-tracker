/**
 * The form engine is driven by plain data. A schema stays JSON-serialisable —
 * async validators are referenced by name through `asyncValidatorRegistry`
 * rather than embedded as functions — so a schema could just as well arrive
 * from the server.
 */

import type { ReactNode } from 'react'

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'money' | 'tags'

export type FieldOption = {
  value: string
  label: string
}

export type FieldValidation = {
  /** Minimum string length, or minimum numeric value for `money`. */
  min?: number
  /** Maximum string length, or maximum numeric value for `money`. */
  max?: number
  /** Source of a `RegExp` applied to `text` and `textarea` values. */
  pattern?: string
  /** Overrides the generated message for `pattern`. */
  message?: string
  /** ISO bounds for `date` fields, passed through to the picker. */
  minDate?: string
  maxDate?: string
}

/**
 * Renders the field only while another field matches. Give either `equals` for
 * a single value or `oneOf` for a set; both stay plain data.
 */
export type VisibleIf = {
  field: string
  equals?: unknown
  oneOf?: unknown[]
}

export type FieldSchema = {
  name: string
  type: FieldType
  label: string
  required?: boolean
  placeholder?: string
  help?: string
  options?: FieldOption[]
  visibleIf?: VisibleIf
  validation?: FieldValidation
  /** Key into `asyncValidatorRegistry`. */
  asyncValidator?: string
  /**
   * Other fields whose value this field's validity depends on. React Hook Form
   * only refreshes the error of the field being edited, so without this a rule
   * spanning two fields keeps showing a stale message after the *other* field
   * changes.
   */
  revalidateOn?: string[]
}

export type FormStep = {
  id: string
  title: string
  description?: string
  fields: FieldSchema[]
}

export type FormSchema = {
  steps: FormStep[]
  /**
   * `single` renders every step as a section on one page; `wizard` renders one
   * step at a time with next/back and validates each step before advancing.
   */
  mode?: 'single' | 'wizard'
}

export type FormValues = Record<string, unknown>

/**
 * Extra data an async validator needs but the form does not own — for the
 * duplicate check, the applications already in the query cache. Threaded from
 * `SchemaForm` through the resolver so validators stay pure functions.
 */
export type ValidationContext = Record<string, unknown>

/** Resolves to an error message, or `null` when the value is acceptable. */
export type AsyncValidator = (
  value: unknown,
  values: FormValues,
  context: ValidationContext,
) => Promise<string | null>

/**
 * Every field component receives the same props. Label, help text and error
 * message are rendered by `SchemaForm`, so a component only draws its control —
 * which is what keeps adding a field type to one registry entry.
 */
export type FieldComponentProps = {
  field: FieldSchema
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  inputId: string
  describedBy: string | undefined
  invalid: boolean
}

export type FieldComponent = (props: FieldComponentProps) => ReactNode

export function allFields(schema: FormSchema): FieldSchema[] {
  return schema.steps.flatMap((step) => step.fields)
}

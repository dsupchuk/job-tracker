import { z } from 'zod'
import { asyncValidatorRegistry } from './asyncValidators'
import type { FieldSchema, FormValues, ValidationContext } from './types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Every rule for a field is expressed as one refinement rather than a chain of
 * Zod combinators. That keeps the "empty is fine unless required" behaviour in
 * a single place and lets messages reference the field label.
 */
function checkString(field: FieldSchema, value: string, ctx: z.RefinementCtx): void {
  const rules = field.validation ?? {}

  if (value.trim() === '') {
    if (field.required) {
      ctx.addIssue({ code: 'custom', message: `${field.label} is required` })
    }
    return
  }

  if (rules.min !== undefined && value.length < rules.min) {
    ctx.addIssue({
      code: 'custom',
      message: `${field.label} must be at least ${rules.min} characters`,
    })
  }
  if (rules.max !== undefined && value.length > rules.max) {
    ctx.addIssue({
      code: 'custom',
      message: `${field.label} must be at most ${rules.max} characters`,
    })
  }
  if (rules.pattern !== undefined && !new RegExp(rules.pattern).test(value)) {
    ctx.addIssue({
      code: 'custom',
      message: rules.message ?? `${field.label} has an invalid format`,
    })
  }
  if (field.type === 'date' && !ISO_DATE.test(value)) {
    ctx.addIssue({ code: 'custom', message: `${field.label} must be a valid date` })
  }
  if (field.type === 'select' && field.options && !field.options.some((o) => o.value === value)) {
    ctx.addIssue({ code: 'custom', message: `${field.label} is not a valid choice` })
  }
}

function checkMoney(field: FieldSchema, value: number | null, ctx: z.RefinementCtx): void {
  const rules = field.validation ?? {}

  if (value === null) {
    if (field.required) {
      ctx.addIssue({ code: 'custom', message: `${field.label} is required` })
    }
    return
  }

  if (!Number.isFinite(value)) {
    ctx.addIssue({ code: 'custom', message: `${field.label} must be a number` })
    return
  }
  if (rules.min !== undefined && value < rules.min) {
    ctx.addIssue({ code: 'custom', message: `${field.label} must be at least ${rules.min}` })
  }
  if (rules.max !== undefined && value > rules.max) {
    ctx.addIssue({ code: 'custom', message: `${field.label} must be at most ${rules.max}` })
  }
}

function checkTags(field: FieldSchema, value: string[], ctx: z.RefinementCtx): void {
  const rules = field.validation ?? {}

  if (value.length === 0 && field.required) {
    ctx.addIssue({ code: 'custom', message: `${field.label} is required` })
    return
  }
  if (rules.max !== undefined && value.length > rules.max) {
    ctx.addIssue({ code: 'custom', message: `${field.label} allows at most ${rules.max} tags` })
  }
}

/**
 * A field that was hidden and shown again comes back as `undefined`, because
 * `unregister` dropped its value. Normalising to the field's own empty value
 * first means such a field reports "is required" rather than a type error.
 */
function baseSchema(field: FieldSchema): z.ZodType {
  switch (field.type) {
    case 'money':
      return z.preprocess(
        (value) => (value === undefined || value === '' ? null : value),
        z
          .number()
          .nullable()
          .superRefine((value, ctx) => checkMoney(field, value, ctx)),
      )
    case 'tags':
      return z.preprocess(
        (value) => value ?? [],
        z.array(z.string()).superRefine((value, ctx) => checkTags(field, value, ctx)),
      )
    default:
      return z.preprocess(
        (value) => value ?? '',
        z.string().superRefine((value, ctx) => checkString(field, value, ctx)),
      )
  }
}

/**
 * Builds the validation schema for exactly the fields passed in. Callers pass
 * only the currently visible fields, so a hidden field can never block submit
 * and its value is stripped from the parsed result.
 */
export function buildZodSchema(
  fields: FieldSchema[],
  context: ValidationContext = {},
): z.ZodType<FormValues, FormValues> {
  const shape = Object.fromEntries(fields.map((field) => [field.name, baseSchema(field)]))

  const asyncFields = fields.filter((field) => field.asyncValidator !== undefined)
  const object = z.object(shape)
  if (asyncFields.length === 0) return object as z.ZodType<FormValues, FormValues>

  return object.superRefine(async (values, ctx) => {
    await Promise.all(
      asyncFields.map(async (field) => {
        const validate = asyncValidatorRegistry[field.asyncValidator ?? '']
        if (!validate) return

        const message = await validate(values[field.name], values, context)
        if (message !== null) {
          ctx.addIssue({ code: 'custom', path: [field.name], message })
        }
      }),
    )
  }) as z.ZodType<FormValues, FormValues>
}

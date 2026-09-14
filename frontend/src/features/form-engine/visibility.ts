import type { FieldSchema, FormValues } from './types'

/** A field with no `visibleIf` is always shown. */
export function isFieldVisible(field: FieldSchema, values: FormValues): boolean {
  const condition = field.visibleIf
  if (!condition) return true

  const actual = values[condition.field]
  if (condition.oneOf !== undefined) return condition.oneOf.includes(actual)
  return actual === condition.equals
}

export function visibleFields(fields: FieldSchema[], values: FormValues): FieldSchema[] {
  return fields.filter((field) => isFieldVisible(field, values))
}

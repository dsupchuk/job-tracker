import { DateField, MoneyField, SelectField, TagsField, TextField, TextareaField } from './fields'
import type { FieldComponent, FieldType } from './types'

/**
 * Field type → component. Adding a type means one entry here plus one line in
 * a schema; `SchemaForm` itself never changes.
 */
export const fieldRegistry: Record<FieldType, FieldComponent> = {
  text: TextField,
  textarea: TextareaField,
  select: SelectField,
  date: DateField,
  money: MoneyField,
  tags: TagsField,
}

import { useState, type KeyboardEvent } from 'react'
import type { FieldComponent, FieldComponentProps } from './types'

const CONTROL =
  'border-border-subtle bg-surface text-content placeholder:text-content-muted rounded-data text-data aria-invalid:border-danger w-full border px-3 py-2'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** Props every control shares: identity, description wiring and state flags. */
function shared({ field, inputId, describedBy, invalid, onBlur }: FieldComponentProps) {
  return {
    id: inputId,
    onBlur,
    'aria-describedby': describedBy,
    'aria-invalid': invalid || undefined,
    'aria-required': field.required || undefined,
  }
}

export const TextField: FieldComponent = (props) => (
  <input
    type="text"
    className={CONTROL}
    placeholder={props.field.placeholder}
    value={asString(props.value)}
    onChange={(event) => props.onChange(event.target.value)}
    {...shared(props)}
  />
)

export const TextareaField: FieldComponent = (props) => (
  <textarea
    rows={4}
    className={CONTROL}
    placeholder={props.field.placeholder}
    value={asString(props.value)}
    onChange={(event) => props.onChange(event.target.value)}
    {...shared(props)}
  />
)

export const SelectField: FieldComponent = (props) => (
  <select
    className={CONTROL}
    value={asString(props.value)}
    onChange={(event) => props.onChange(event.target.value)}
    {...shared(props)}
  >
    {!props.field.required && <option value="">—</option>}
    {props.field.options?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

/**
 * A native date input for now. Phase 6 swaps in the accessible custom picker by
 * replacing this one registry entry — no schema or renderer change.
 */
export const DateField: FieldComponent = (props) => (
  <input
    type="date"
    className={CONTROL}
    value={asString(props.value)}
    onChange={(event) => props.onChange(event.target.value)}
    {...shared(props)}
  />
)

export const MoneyField: FieldComponent = (props) => (
  <div className="relative">
    <span className="text-content-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
      $
    </span>
    <input
      type="number"
      inputMode="numeric"
      step={1000}
      min={0}
      className={`${CONTROL} pl-7 tabular-nums`}
      placeholder={props.field.placeholder}
      value={typeof props.value === 'number' ? props.value : ''}
      // An empty input is `null`, not `0` — the API treats them differently.
      onChange={(event) =>
        props.onChange(event.target.value === '' ? null : event.target.valueAsNumber)
      }
      {...shared(props)}
    />
  </div>
)

export const TagsField: FieldComponent = (props) => {
  const tags = Array.isArray(props.value) ? (props.value as string[]) : []
  const [draft, setDraft] = useState('')

  function commit(raw: string) {
    const tag = raw.trim()
    if (tag !== '' && !tags.includes(tag)) props.onChange([...tags, tag])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter would otherwise submit the whole form.
      event.preventDefault()
      commit(draft)
    } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      props.onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className={`${CONTROL} flex flex-wrap items-center gap-1.5`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-surface-muted text-content inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => props.onChange(tags.filter((value) => value !== tag))}
            className="text-content-muted hover:text-content"
          >
            ×<span className="sr-only">Remove {tag}</span>
          </button>
        </span>
      ))}
      <input
        type="text"
        className="text-content placeholder:text-content-muted text-data min-w-24 flex-1 bg-transparent outline-none"
        placeholder={props.field.placeholder ?? 'Add and press Enter'}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        {...shared(props)}
        onBlur={() => {
          commit(draft)
          props.onBlur()
        }}
      />
    </div>
  )
}

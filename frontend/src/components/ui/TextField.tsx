import { useId, type InputHTMLAttributes, type Ref } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | undefined
  ref?: Ref<HTMLInputElement>
}

export function TextField({ label, error, id, ref, ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-content text-data font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="border-border-subtle bg-surface text-content placeholder:text-content-muted rounded-data text-data aria-invalid:border-danger border px-3 py-2"
        {...props}
      />
      {error && (
        <p id={errorId} className="text-danger text-data">
          {error}
        </p>
      )}
    </div>
  )
}

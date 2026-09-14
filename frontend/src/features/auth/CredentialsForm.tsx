import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { credentialsSchema, type CredentialsValues } from './authSchema'

type CredentialsFormProps = {
  title: string
  submitLabel: string
  pending: boolean
  errorMessage?: string | undefined
  footer: ReactNode
  onSubmit: (values: CredentialsValues) => void
}

export function CredentialsForm({
  title,
  submitLabel,
  pending,
  errorMessage,
  footer,
  onSubmit,
}: CredentialsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="border-border-subtle bg-surface w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <h1 className="text-content text-xl font-semibold">{title}</h1>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? 'Please wait…' : submitLabel}
          </Button>
        </form>

        <p className="text-content-muted mt-6 text-center text-sm">{footer}</p>
      </div>
    </main>
  )
}

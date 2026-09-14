import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { credentialsSchema, type CredentialsValues } from './authSchema'

type CredentialsFormProps = {
  title: string
  intro: string
  submitLabel: string
  pending: boolean
  errorMessage?: string | undefined
  footer: ReactNode
  aside?: ReactNode
  onSubmit: (values: CredentialsValues) => void
}

export function CredentialsForm({
  title,
  intro,
  submitLabel,
  pending,
  errorMessage,
  footer,
  aside,
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
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-content text-title font-semibold tracking-tight">Job Tracker</p>
        <h1 className="text-content-muted mt-1 max-w-[40ch]">{intro}</h1>

        <div className="border-border-subtle bg-surface rounded-card mt-8 border p-6">
          <h2 className="text-content text-lead font-semibold tracking-tight">{title}</h2>

          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <p role="alert" className="text-danger text-data">
                {errorMessage}
              </p>
            )}

            <Button type="submit" disabled={pending}>
              {pending ? 'Signing in' : submitLabel}
            </Button>
          </form>

          {aside}
        </div>

        <p className="text-content-muted text-data mt-6">{footer}</p>
      </div>
    </main>
  )
}

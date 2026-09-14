import { z } from 'zod'

/** Mirrors the backend's `RegisterRequest` / `LoginRequest` constraints. */
export const credentialsSchema = z.object({
  email: z.email('Enter a valid email address').max(255),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(100, 'Password must be at most 100 characters'),
})

export type CredentialsValues = z.infer<typeof credentialsSchema>

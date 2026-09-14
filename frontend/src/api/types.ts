/** Mirrors the backend DTOs. Keep in sync with `/v3/api-docs`. */

export const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type Application = {
  id: number
  position: string
  company: string | null
  status: ApplicationStatus
  sourceUrl: string | null
  salaryMin: number | null
  salaryMax: number | null
  /** ISO date, e.g. `2026-09-14`. */
  appliedAt: string | null
  deadline: string | null
  techStack: string | null
  createdAt: string
  updatedAt: string
}

export type ApplicationRequest = {
  position: string
  company?: string | null
  status?: ApplicationStatus
  sourceUrl?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  appliedAt?: string | null
  deadline?: string | null
  techStack?: string | null
}

/** Spring Data `Page<T>`, trimmed to the fields the UI actually reads. */
export type Page<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type PageParams = {
  page?: number
  size?: number
  sort?: string
}

export type StatusHistoryEntry = {
  id: number
  /** Null for the opening entry written when the application is created. */
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  changedAt: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export type FieldValidationError = {
  field: string
  message: string
}

/** The shape produced by the backend's `@RestControllerAdvice`. */
export type ApiError = {
  timestamp: string
  status: number
  code: string
  message: string
  fieldErrors?: FieldValidationError[]
}

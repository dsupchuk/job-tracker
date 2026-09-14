import type { Application } from '@/api/types'
import type { AsyncValidator } from './types'

function normalise(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Async validators are looked up by name so a field schema stays plain data.
 * Add an entry here and reference it with `asyncValidator: '<key>'`.
 */
export const asyncValidatorRegistry: Record<string, AsyncValidator> = {
  /**
   * Rejects the same role at the same company twice. Reads the applications the
   * query cache already holds rather than issuing another request. The same
   * position at a different company is fine, which is why both fields matter.
   */
  uniqueApplication: async (value, values, context) => {
    const position = normalise(value)
    if (position === '') return null

    const existing = Array.isArray(context.applications)
      ? (context.applications as Application[])
      : []
    const currentId = typeof context.currentId === 'number' ? context.currentId : null
    const company = normalise(values.company)

    const clash = existing.some(
      (application) =>
        application.id !== currentId &&
        normalise(application.position) === position &&
        normalise(application.company) === company,
    )

    if (!clash) return null
    return company === ''
      ? 'You already track this position with no company set'
      : 'You already track this position at this company'
  },
}

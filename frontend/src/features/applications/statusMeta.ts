import type { ApplicationStatus } from '@/api/types'

/**
 * The funnel is ordered, so the UI draws it as a position rather than colouring
 * it. `step` is how far along the four advancing stages an application has got;
 * `out` marks the terminal status, which sits outside the progression entirely.
 */
export const FUNNEL_STEPS = 4

export const STATUS_META: Record<ApplicationStatus, { label: string; step: number; out?: true }> = {
  SAVED: { label: 'Saved', step: 0 },
  APPLIED: { label: 'Applied', step: 1 },
  SCREENING: { label: 'Screening', step: 2 },
  INTERVIEW: { label: 'Interview', step: 3 },
  OFFER: { label: 'Offer', step: 4 },
  REJECTED: { label: 'Rejected', step: 0, out: true },
}

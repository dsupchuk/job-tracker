import type { ApplicationStatus } from '@/api/types'

/**
 * Display metadata per status. Colours are chosen so the badge text clears
 * 4.5:1 against its own background in both themes (audited in Phase 6).
 */
export const STATUS_META: Record<ApplicationStatus, { label: string; badgeClass: string }> = {
  SAVED: {
    label: 'Saved',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  APPLIED: {
    label: 'Applied',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  },
  SCREENING: {
    label: 'Screening',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  },
  OFFER: {
    label: 'Offer',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  },
}

const MONEY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** `90000, 120000` → `$90,000 – $120,000`; a single bound renders on its own. */
export function formatSalaryRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${MONEY.format(min)} – ${MONEY.format(max)}`
  if (min !== null) return `from ${MONEY.format(min)}`
  if (max !== null) return `up to ${MONEY.format(max)}`
  return ''
}

/** ISO date → `14 Sep 2026`. Returns an empty string for a missing date. */
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Whole days between `iso` and today; negative means the date is in the future. */
export function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const then = new Date(`${iso}T00:00:00`).getTime()
  if (Number.isNaN(then)) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - then) / 86_400_000)
}

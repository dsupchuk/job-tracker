/**
 * Calendar arithmetic in local time. Everything here takes and returns plain
 * `Date` values built from year/month/day, never parsed from a UTC string — a
 * date picker that shifts by a day in a negative offset is worse than useless.
 */

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** `2026-09-14` → local midnight on that day. Returns null for anything else. */
export function fromIso(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

export function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Clamps the day when the target month is shorter — 31 Jan + 1 month is 28 Feb. */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

/** Weeks start on Monday. */
export function startOfWeek(date: Date): Date {
  const weekday = (date.getDay() + 6) % 7
  return addDays(date, -weekday)
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * Six Monday-first weeks covering the given month. Always six so the grid does
 * not change height as months change, which would make the popup jump.
 */
export function monthGrid(reference: Date): Date[][] {
  const firstOfMonth = new Date(reference.getFullYear(), reference.getMonth(), 1)
  const start = startOfWeek(firstOfMonth)

  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  )
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime()
}

/** Keeps `date` inside [min, max]; either bound may be absent. */
export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min && isBefore(date, min)) return min
  if (max && isBefore(max, date)) return max
  return date
}

export function isOutOfRange(date: Date, min: Date | null, max: Date | null): boolean {
  return (min !== null && isBefore(date, min)) || (max !== null && isBefore(max, date))
}

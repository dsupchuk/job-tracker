import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  fromIso,
  isOutOfRange,
  isSameDay,
  monthGrid,
  startOfWeek,
  toIso,
} from './calendar'

const iso = (value: string) => fromIso(value) as Date

describe('fromIso / toIso', () => {
  it('round-trips a date without drifting across time zones', () => {
    expect(toIso(iso('2026-09-14'))).toBe('2026-09-14')
  })

  it('reads the parts as local, not UTC', () => {
    const date = iso('2026-01-01')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 0, 1])
  })

  it('rejects anything that is not a plain ISO date', () => {
    expect(fromIso('')).toBeNull()
    expect(fromIso(null)).toBeNull()
    expect(fromIso('14/09/2026')).toBeNull()
    expect(fromIso('2026-09-14T10:00:00Z')).toBeNull()
  })
})

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(toIso(addDays(iso('2026-09-30'), 1))).toBe('2026-10-01')
  })

  it('crosses a leap day backwards', () => {
    expect(toIso(addDays(iso('2028-03-01'), -1))).toBe('2028-02-29')
  })
})

describe('addMonths', () => {
  it('clamps the day when the target month is shorter', () => {
    expect(toIso(addMonths(iso('2026-01-31'), 1))).toBe('2026-02-28')
  })

  it('keeps the day when the target month is long enough', () => {
    expect(toIso(addMonths(iso('2026-09-14'), -1))).toBe('2026-08-14')
  })
})

describe('week bounds', () => {
  it('starts weeks on Monday', () => {
    // 2026-09-14 is a Monday.
    expect(toIso(startOfWeek(iso('2026-09-14')))).toBe('2026-09-14')
    expect(toIso(startOfWeek(iso('2026-09-20')))).toBe('2026-09-14')
    expect(toIso(endOfWeek(iso('2026-09-14')))).toBe('2026-09-20')
  })
})

describe('monthGrid', () => {
  const grid = monthGrid(iso('2026-09-14'))

  it('always returns six weeks so the popup never changes height', () => {
    expect(grid).toHaveLength(6)
    expect(grid.every((week) => week.length === 7)).toBe(true)
  })

  it('begins on the Monday on or before the first of the month', () => {
    expect(toIso(grid[0]?.[0] as Date)).toBe('2026-08-31')
  })

  it('runs in unbroken daily steps', () => {
    const flat = grid.flat()
    const gaps = flat
      .slice(1)
      .filter((day, index) => !isSameDay(day, addDays(flat[index] as Date, 1)))
    expect(gaps).toEqual([])
  })
})

describe('range constraints', () => {
  const min = iso('2026-09-10')
  const max = iso('2026-09-20')

  it('pulls a date back inside the range', () => {
    expect(toIso(clampDate(iso('2026-09-01'), min, max))).toBe('2026-09-10')
    expect(toIso(clampDate(iso('2026-09-30'), min, max))).toBe('2026-09-20')
    expect(toIso(clampDate(iso('2026-09-15'), min, max))).toBe('2026-09-15')
  })

  it('treats the bounds themselves as in range', () => {
    expect(isOutOfRange(min, min, max)).toBe(false)
    expect(isOutOfRange(max, min, max)).toBe(false)
    expect(isOutOfRange(iso('2026-09-21'), min, max)).toBe(true)
  })

  it('ignores a bound that is absent', () => {
    expect(isOutOfRange(iso('1999-01-01'), null, max)).toBe(false)
    expect(isOutOfRange(iso('2099-01-01'), min, null)).toBe(false)
    // The bound that is present still applies.
    expect(isOutOfRange(iso('1999-01-01'), min, null)).toBe(true)
    expect(isOutOfRange(iso('2099-01-01'), null, max)).toBe(true)
  })
})

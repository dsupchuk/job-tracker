import { describe, expect, it } from 'vitest'
import type { Application } from '@/api/types'
import { sortColumn } from './columnOrder'

function card(id: number, appliedAt: string | null): Application {
  return {
    id,
    position: `Role ${id}`,
    company: null,
    status: 'APPLIED',
    sourceUrl: null,
    salaryMin: null,
    salaryMax: null,
    appliedAt,
    deadline: null,
    techStack: null,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  }
}

describe('sortColumn', () => {
  it('puts whatever has been waiting longest at the top', () => {
    const sorted = sortColumn([card(1, '2026-09-01'), card(2, '2026-07-01'), card(3, '2026-08-01')])
    expect(sorted.map((a) => a.id)).toEqual([2, 3, 1])
  })

  it('sorts applications with no applied date after the rest, oldest first', () => {
    const sorted = sortColumn([card(5, null), card(1, '2026-09-01'), card(4, null)])
    expect(sorted.map((a) => a.id)).toEqual([1, 4, 5])
  })

  it('breaks ties on id so the order never wobbles between renders', () => {
    const sorted = sortColumn([card(9, '2026-08-01'), card(2, '2026-08-01')])
    expect(sorted.map((a) => a.id)).toEqual([2, 9])
  })

  it('does not mutate the input', () => {
    const input = [card(2, '2026-09-01'), card(1, '2026-07-01')]
    sortColumn(input)
    expect(input.map((a) => a.id)).toEqual([2, 1])
  })
})

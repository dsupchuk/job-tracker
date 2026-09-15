import { describe, expect, it } from 'vitest'
import type { Application } from '@/api/types'
import { toCsv } from './exportCsv'

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    position: 'Backend Engineer',
    company: 'Stripe',
    status: 'APPLIED',
    sourceUrl: 'https://example.com/jobs/1',
    salaryMin: 120000,
    salaryMax: 160000,
    appliedAt: '2026-08-01',
    deadline: null,
    techStack: 'Java, Spring',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

const lines = (csv: string) => csv.split('\r\n')

describe('toCsv', () => {
  it('writes a header naming every exported column', () => {
    expect(lines(toCsv([]))[0]).toBe(
      'position,company,status,appliedAt,deadline,salaryMin,salaryMax,techStack,sourceUrl',
    )
  })

  it('emits one row per application, quoted', () => {
    const csv = lines(toCsv([application()]))
    expect(csv).toHaveLength(2)
    expect(csv[1]).toBe(
      '"Backend Engineer","Stripe","APPLIED","2026-08-01","","120000","160000","Java, Spring","https://example.com/jobs/1"',
    )
  })

  it('quotes a value containing the delimiter so columns do not shift', () => {
    // `techStack` is comma-separated, which is exactly the hazard.
    const csv = lines(toCsv([application({ techStack: 'Go, gRPC, AWS' })]))[1] ?? ''
    expect(csv).toContain('"Go, gRPC, AWS"')
    expect(csv.split('","')).toHaveLength(9)
  })

  it('doubles an embedded quote rather than breaking the field', () => {
    const csv = lines(toCsv([application({ company: 'The "Big" Co' })]))[1] ?? ''
    expect(csv).toContain('"The ""Big"" Co"')
  })

  it('renders a missing value as an empty field, never as "null"', () => {
    const csv = lines(toCsv([application({ company: null, salaryMin: null, techStack: null })]))[1]
    expect(csv).not.toContain('null')
    expect(csv).toContain('"Backend Engineer","",')
  })

  it('survives a newline inside a value', () => {
    const csv = toCsv([application({ position: 'Line one\nLine two' })])
    // The row itself still ends with the CRLF separator, and the value stays quoted.
    expect(csv).toContain('"Line one\nLine two"')
    expect(lines(csv)).toHaveLength(2)
  })
})

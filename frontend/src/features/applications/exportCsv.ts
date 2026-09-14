import type { Application } from '@/api/types'

const COLUMNS = [
  'position',
  'company',
  'status',
  'appliedAt',
  'deadline',
  'salaryMin',
  'salaryMax',
  'techStack',
  'sourceUrl',
] as const satisfies ReadonlyArray<keyof Application>

/** RFC 4180 quoting: wrap every field, double any embedded quote. */
function escapeCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export function toCsv(applications: Application[]): string {
  const header = COLUMNS.join(',')
  const rows = applications.map((application) =>
    COLUMNS.map((column) => escapeCell(application[column])).join(','),
  )
  return [header, ...rows].join('\r\n')
}

/** Downloads the given rows — whatever the table currently shows, filters included. */
export function downloadCsv(applications: Application[], filename = 'applications.csv'): void {
  // The BOM keeps Excel from mangling non-ASCII characters.
  const blob = new Blob(['﻿', toCsv(applications)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

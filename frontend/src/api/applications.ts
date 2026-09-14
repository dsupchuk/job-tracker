import { apiClient } from './client'
import type {
  Application,
  ApplicationRequest,
  ApplicationStatus,
  Page,
  PageParams,
  StatusHistoryEntry,
} from './types'

const BASE = '/api/applications'

export async function listApplications(params: PageParams = {}): Promise<Page<Application>> {
  const { data } = await apiClient.get<Page<Application>>(BASE, { params })
  return data
}

/** Page size used when pulling the whole list for the client-side table. */
const BULK_PAGE_SIZE = 200

/**
 * Loads every application the user owns. The table sorts, filters and
 * virtualises on the client, so it needs the full set rather than one page.
 */
export async function listAllApplications(): Promise<Application[]> {
  const params = { size: BULK_PAGE_SIZE, sort: 'createdAt,desc' }
  const firstPage = await listApplications({ ...params, page: 0 })

  const remaining = Array.from({ length: Math.max(firstPage.totalPages - 1, 0) }, (_, index) =>
    listApplications({ ...params, page: index + 1 }),
  )
  const pages = await Promise.all(remaining)

  return [firstPage, ...pages].flatMap((page) => page.content)
}

export async function getApplication(id: number): Promise<Application> {
  const { data } = await apiClient.get<Application>(`${BASE}/${id}`)
  return data
}

export async function createApplication(body: ApplicationRequest): Promise<Application> {
  const { data } = await apiClient.post<Application>(BASE, body)
  return data
}

export async function updateApplication(
  id: number,
  body: ApplicationRequest,
): Promise<Application> {
  const { data } = await apiClient.put<Application>(`${BASE}/${id}`, body)
  return data
}

export async function deleteApplication(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}

/** Moves an application to a new status — what a Kanban drop sends. */
export async function changeApplicationStatus(
  id: number,
  status: ApplicationStatus,
): Promise<Application> {
  const { data } = await apiClient.patch<Application>(`${BASE}/${id}/status`, { status })
  return data
}

export async function getStatusHistory(id: number): Promise<StatusHistoryEntry[]> {
  const { data } = await apiClient.get<StatusHistoryEntry[]>(`${BASE}/${id}/history`)
  return data
}

/** Query keys are centralised so cache invalidation stays consistent. */
export const applicationKeys = {
  all: ['applications'] as const,
  list: (params: PageParams) => ['applications', 'list', params] as const,
  listAll: () => ['applications', 'list', 'all'] as const,
  detail: (id: number) => ['applications', 'detail', id] as const,
  history: (id: number) => ['applications', 'history', id] as const,
}

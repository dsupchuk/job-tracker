import { apiClient } from './client'
import type { Application, ApplicationRequest, Page, PageParams } from './types'

const BASE = '/api/applications'

export async function listApplications(params: PageParams = {}): Promise<Page<Application>> {
  const { data } = await apiClient.get<Page<Application>>(BASE, { params })
  return data
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

/** Query keys are centralised so cache invalidation stays consistent. */
export const applicationKeys = {
  all: ['applications'] as const,
  list: (params: PageParams) => ['applications', 'list', params] as const,
  detail: (id: number) => ['applications', 'detail', id] as const,
}

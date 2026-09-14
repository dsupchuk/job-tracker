import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { applicationKeys } from '@/api/applications'
import type { Application } from '@/api/types'
import { DatePicker } from '@/components/ui/DatePicker'
import {
  buildApplicationFormSchema,
  toFormValues,
} from '@/features/applications/applicationFormSchema'
import { ApplicationsTable } from '@/features/applications/ApplicationsTable'
import { ApplicationsToolbar } from '@/features/applications/ApplicationsToolbar'
import { useApplicationsTable } from '@/features/applications/useApplicationsTable'
import { Board } from '@/features/board/Board'
import { SchemaForm } from '@/features/form-engine/SchemaForm'
import { LoginPage } from '@/features/auth/LoginPage'
import { createTestQueryClient, renderWithProviders } from './providers'

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

const rows = [
  application(),
  application({ id: 2, status: 'OFFER', position: 'Staff Engineer', company: 'Figma' }),
  application({ id: 3, status: 'REJECTED', position: 'Platform Engineer', company: 'Reddit' }),
  application({ id: 4, status: 'SAVED', position: 'DevOps Engineer', appliedAt: null }),
]

function TableHarness() {
  const { table, visibleRows } = useApplicationsTable(rows, () => {})
  return (
    <>
      <ApplicationsToolbar visibleRows={visibleRows} onCreate={() => {}} />
      <ApplicationsTable table={table} />
    </>
  )
}

describe('accessibility', () => {
  it('the applications table and its toolbar have no violations', async () => {
    const { container } = renderWithProviders(<TableHarness />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the board has no violations', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(applicationKeys.listAll(), rows)

    const { container } = renderWithProviders(<Board applications={rows} onOpen={() => {}} />, {
      queryClient,
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the application form has no violations', async () => {
    const { container } = renderWithProviders(
      <SchemaForm
        schema={buildApplicationFormSchema()}
        defaultValues={toFormValues(null)}
        submitLabel="Create application"
        onSubmit={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the form reports its errors accessibly', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <SchemaForm
        schema={buildApplicationFormSchema()}
        defaultValues={toFormValues(null)}
        submitLabel="Create application"
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create application' }))
    await screen.findByText('Position is required')

    // An invalid field must point at its message, not merely turn red.
    const position = screen.getByLabelText('Position')
    expect(position).toHaveAttribute('aria-invalid', 'true')
    expect(position.getAttribute('aria-describedby')).toBeTruthy()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the open date picker has no violations', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <>
        <label htmlFor="applied-on">Applied on</label>
        <DatePicker value="2026-09-14" onChange={vi.fn()} inputId="applied-on" />
      </>,
    )

    // The associated `<label>` names the trigger; its value is a description.
    await user.click(screen.getByRole('button', { name: 'Applied on' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the login page has no violations', async () => {
    const { container } = renderWithProviders(<LoginPage />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

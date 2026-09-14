import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SchemaForm } from './SchemaForm'
import type { FormSchema } from './types'

const STATUS_OPTIONS = [
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
]

function renderForm(schema: FormSchema, defaultValues: Record<string, unknown>) {
  const onSubmit = vi.fn()
  render(
    <SchemaForm
      schema={schema}
      defaultValues={defaultValues}
      submitLabel="Save"
      onSubmit={onSubmit}
    />,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('SchemaForm rendering', () => {
  it('renders one control per field type from the registry', () => {
    const schema: FormSchema = {
      steps: [
        {
          id: 'all',
          title: 'All',
          fields: [
            { name: 'position', type: 'text', label: 'Position' },
            { name: 'notes', type: 'textarea', label: 'Notes' },
            { name: 'status', type: 'select', label: 'Status', options: STATUS_OPTIONS },
            { name: 'appliedAt', type: 'date', label: 'Applied on' },
            { name: 'salaryMin', type: 'money', label: 'Salary from' },
            { name: 'techStack', type: 'tags', label: 'Tech stack' },
          ],
        },
      ],
    }

    renderForm(schema, {
      position: '',
      notes: '',
      status: 'SAVED',
      appliedAt: '',
      salaryMin: null,
      techStack: [],
    })

    expect(screen.getByLabelText('Position')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Status').tagName).toBe('SELECT')
    // `date` resolves to the custom picker, whose control is a dialog trigger.
    expect(screen.getByLabelText('Applied on')).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.getByLabelText('Salary from')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('Tech stack')).toBeInTheDocument()
  })
})

describe('SchemaForm validation', () => {
  const schema: FormSchema = {
    steps: [
      {
        id: 'main',
        title: 'Main',
        fields: [
          {
            name: 'position',
            type: 'text',
            label: 'Position',
            required: true,
            validation: { max: 5 },
          },
        ],
      },
    ],
  }

  it('blocks submit and shows the generated message', async () => {
    const { onSubmit, user } = renderForm(schema, { position: '' })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Position is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('reports a rule derived from the schema, then submits once fixed', async () => {
    const { onSubmit, user } = renderForm(schema, { position: '' })
    const input = screen.getByLabelText('Position')

    await user.type(input, 'Engineer')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Position must be at most 5 characters')).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'Dev')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ position: 'Dev' })
  })
})

describe('SchemaForm conditional visibility', () => {
  const schema: FormSchema = {
    steps: [
      {
        id: 'main',
        title: 'Main',
        fields: [
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            required: true,
            options: STATUS_OPTIONS,
          },
          {
            name: 'appliedAt',
            type: 'date',
            label: 'Applied on',
            required: true,
            visibleIf: { field: 'status', oneOf: ['APPLIED'] },
          },
        ],
      },
    ],
  }

  it('hides the dependent field and lets the form submit without it', async () => {
    const { onSubmit, user } = renderForm(schema, { status: 'SAVED', appliedAt: '' })

    expect(screen.queryByLabelText('Applied on')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    // A hidden required field must not fail validation, and must not be submitted.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ status: 'SAVED' })
  })

  it('shows the dependent field and enforces it once the condition matches', async () => {
    const { onSubmit, user } = renderForm(schema, { status: 'SAVED', appliedAt: '' })

    await user.selectOptions(screen.getByLabelText('Status'), 'APPLIED')
    expect(screen.getByLabelText('Applied on')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Applied on is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('SchemaForm cross-field revalidation', () => {
  const schema: FormSchema = {
    steps: [
      {
        id: 'main',
        title: 'Main',
        fields: [
          {
            name: 'position',
            type: 'text',
            label: 'Position',
            required: true,
            asyncValidator: 'uniqueApplication',
            revalidateOn: ['company'],
          },
          { name: 'company', type: 'text', label: 'Company' },
        ],
      },
    ],
  }

  it('clears a stale error once the field it depends on changes', async () => {
    const onSubmit = vi.fn()
    render(
      <SchemaForm
        schema={schema}
        defaultValues={{ position: '', company: '' }}
        submitLabel="Save"
        onSubmit={onSubmit}
        validationContext={{
          applications: [{ id: 1, position: 'Backend Engineer', company: 'Figma' }],
          currentId: null,
        }}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Position'), 'Backend Engineer')
    await user.type(screen.getByLabelText('Company'), 'Figma')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('You already track this position at this company'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    // Editing `company` must refresh the error that lives on `position`.
    await user.clear(screen.getByLabelText('Company'))
    await user.type(screen.getByLabelText('Company'), 'Linear')

    await waitFor(() =>
      expect(
        screen.queryByText('You already track this position at this company'),
      ).not.toBeInTheDocument(),
    )
  })
})

describe('SchemaForm wizard mode', () => {
  const schema: FormSchema = {
    mode: 'wizard',
    steps: [
      {
        id: 'one',
        title: 'Role',
        fields: [{ name: 'position', type: 'text', label: 'Position', required: true }],
      },
      {
        id: 'two',
        title: 'Details',
        fields: [{ name: 'notes', type: 'textarea', label: 'Notes' }],
      },
    ],
  }

  it('validates the current step before advancing', async () => {
    const { user } = renderForm(schema, { position: '', notes: '' })

    expect(screen.getByText('Step 1 of 2 — Role')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Position is required')).toBeInTheDocument()
    expect(screen.queryByLabelText('Notes')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Position'), 'Engineer')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByLabelText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 2 — Details')).toBeInTheDocument()
  })
})

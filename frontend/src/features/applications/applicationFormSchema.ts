import { APPLICATION_STATUSES, type Application, type ApplicationRequest } from '@/api/types'
import type { FormSchema, FormValues } from '@/features/form-engine/types'
import { STATUS_META } from './statusMeta'

/** Every status except `SAVED` means the application was actually sent. */
const SENT_STATUSES = APPLICATION_STATUSES.filter((status) => status !== 'SAVED')

/**
 * The application form expressed as data, not JSX. Adding a field here is the
 * only change needed as long as its type already exists in `fieldRegistry`.
 *
 * One step on purpose: nine fields do not need section headings, and a heading
 * reading "Role" directly above a field labelled "Position" only restates it.
 * The engine still supports grouped and wizard forms — this form just is not one.
 */
export const applicationFormSchema: FormSchema = {
  steps: [
    {
      id: 'application',
      title: 'Application',
      fields: [
        {
          name: 'position',
          type: 'text',
          label: 'Position',
          required: true,
          placeholder: 'Backend Engineer',
          validation: { max: 255 },
          // Checks position and company together — see `asyncValidators.ts`.
          asyncValidator: 'uniqueApplication',
          revalidateOn: ['company'],
        },
        {
          name: 'company',
          type: 'text',
          label: 'Company',
          placeholder: 'Stripe',
          validation: { max: 255 },
        },
        {
          name: 'status',
          type: 'select',
          label: 'Status',
          required: true,
          options: APPLICATION_STATUSES.map((status) => ({
            value: status,
            label: STATUS_META[status].label,
          })),
        },
        {
          name: 'techStack',
          type: 'tags',
          label: 'Tech stack',
          placeholder: 'Add a technology and press Enter',
          validation: { max: 20 },
        },
        {
          name: 'appliedAt',
          type: 'date',
          label: 'Applied on',
          help: 'Only relevant once the application has been sent.',
          visibleIf: { field: 'status', oneOf: [...SENT_STATUSES] },
        },
        {
          name: 'salaryMin',
          type: 'money',
          label: 'Salary from',
          validation: { min: 0 },
        },
        {
          name: 'salaryMax',
          type: 'money',
          label: 'Salary to',
          validation: { min: 0 },
        },
        { name: 'deadline', type: 'date', label: 'Deadline' },
        {
          name: 'sourceUrl',
          type: 'text',
          label: 'Job posting',
          placeholder: 'https://…',
          validation: {
            max: 2048,
            pattern: '^https?://',
            message: 'Must start with http:// or https://',
          },
        },
      ],
    },
  ],
}

function splitTechStack(techStack: string | null): string[] {
  if (!techStack) return []
  return techStack
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '')
}

/** API shape → form values. `null` becomes the empty value each field expects. */
export function toFormValues(application: Application | null): FormValues {
  return {
    position: application?.position ?? '',
    company: application?.company ?? '',
    status: application?.status ?? 'SAVED',
    techStack: splitTechStack(application?.techStack ?? null),
    appliedAt: application?.appliedAt ?? '',
    salaryMin: application?.salaryMin ?? null,
    salaryMax: application?.salaryMax ?? null,
    deadline: application?.deadline ?? '',
    sourceUrl: application?.sourceUrl ?? '',
  }
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function money(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Form values → API shape. Hidden fields are already absent from `values`, so
 * an unsent application never carries an applied date.
 */
export function toRequest(values: FormValues): ApplicationRequest {
  const status = APPLICATION_STATUSES.find((candidate) => candidate === values.status)
  const tags = Array.isArray(values.techStack) ? (values.techStack as string[]) : []

  return {
    position: text(values.position) ?? '',
    company: text(values.company),
    status: status ?? 'SAVED',
    techStack: tags.length > 0 ? tags.join(', ') : null,
    appliedAt: text(values.appliedAt),
    deadline: text(values.deadline),
    salaryMin: money(values.salaryMin),
    salaryMax: money(values.salaryMax),
    sourceUrl: text(values.sourceUrl),
  }
}

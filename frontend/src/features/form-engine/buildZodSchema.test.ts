import { describe, expect, it } from 'vitest'
import { buildZodSchema } from './buildZodSchema'
import type { FieldSchema, ValidationContext } from './types'

function messagesFor(fields: FieldSchema[], values: Record<string, unknown>) {
  const result = buildZodSchema(fields).safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  )
}

const position: FieldSchema = {
  name: 'position',
  type: 'text',
  label: 'Position',
  required: true,
  validation: { max: 10 },
}

describe('buildZodSchema', () => {
  it('reports a required field that is blank', () => {
    expect(messagesFor([position], { position: '   ' })).toEqual({
      position: 'Position is required',
    })
  })

  it('accepts a value within the length limit', () => {
    expect(messagesFor([position], { position: 'Engineer' })).toEqual({})
  })

  it('enforces the maximum length', () => {
    expect(messagesFor([position], { position: 'Staff Backend Engineer' })).toEqual({
      position: 'Position must be at most 10 characters',
    })
  })

  it('leaves an optional field alone when it is empty', () => {
    const optional: FieldSchema = {
      name: 'sourceUrl',
      type: 'text',
      label: 'Job posting',
      validation: { pattern: '^https?://', message: 'Must start with http:// or https://' },
    }

    expect(messagesFor([optional], { sourceUrl: '' })).toEqual({})
    expect(messagesFor([optional], { sourceUrl: 'ftp://example.com' })).toEqual({
      sourceUrl: 'Must start with http:// or https://',
    })
  })

  it('treats an empty money field as absent but enforces bounds on a value', () => {
    const salary: FieldSchema = {
      name: 'salaryMin',
      type: 'money',
      label: 'Salary from',
      validation: { min: 1000 },
    }

    expect(messagesFor([salary], { salaryMin: null })).toEqual({})
    expect(messagesFor([salary], { salaryMin: 500 })).toEqual({
      salaryMin: 'Salary from must be at least 1000',
    })
  })

  it('rejects a select value outside its options', () => {
    const status: FieldSchema = {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { value: 'SAVED', label: 'Saved' },
        { value: 'APPLIED', label: 'Applied' },
      ],
    }

    expect(messagesFor([status], { status: 'APPLIED' })).toEqual({})
    expect(messagesFor([status], { status: 'BOGUS' })).toEqual({
      status: 'Status is not a valid choice',
    })
  })

  it('caps the number of tags', () => {
    const techStack: FieldSchema = {
      name: 'techStack',
      type: 'tags',
      label: 'Tech stack',
      validation: { max: 2 },
    }

    expect(messagesFor([techStack], { techStack: ['Java', 'Spring'] })).toEqual({})
    expect(messagesFor([techStack], { techStack: ['Java', 'Spring', 'Kafka'] })).toEqual({
      techStack: 'Tech stack allows at most 2 tags',
    })
  })

  it('only validates the fields it was given, and strips the rest', () => {
    const result = buildZodSchema([position]).safeParse({
      position: 'Engineer',
      appliedAt: 'not-a-date',
    })

    expect(result.success).toBe(true)
    expect(result.success && result.data).toEqual({ position: 'Engineer' })
  })

  describe('async validators from the registry', () => {
    const fields: FieldSchema[] = [
      {
        name: 'position',
        type: 'text',
        label: 'Position',
        required: true,
        asyncValidator: 'uniqueApplication',
      },
      { name: 'company', type: 'text', label: 'Company' },
    ]
    const context: ValidationContext = {
      applications: [{ id: 7, position: 'Backend Engineer', company: 'Stripe' }],
      currentId: null,
    }

    async function check(values: Record<string, unknown>, ctx = context) {
      const result = await buildZodSchema(fields, ctx).safeParseAsync(values)
      return result.success ? null : (result.error.issues[0]?.message ?? null)
    }

    it('rejects the same position at the same company', async () => {
      expect(await check({ position: 'backend engineer', company: 'stripe' })).toBe(
        'You already track this position at this company',
      )
    })

    it('allows the same position at a different company', async () => {
      expect(await check({ position: 'Backend Engineer', company: 'Datadog' })).toBeNull()
    })

    it('allows a different position at the same company', async () => {
      expect(await check({ position: 'Platform Engineer', company: 'Stripe' })).toBeNull()
    })

    it('does not flag a record against itself while editing', async () => {
      expect(
        await check(
          { position: 'Backend Engineer', company: 'Stripe' },
          { ...context, currentId: 7 },
        ),
      ).toBeNull()
    })
  })
})

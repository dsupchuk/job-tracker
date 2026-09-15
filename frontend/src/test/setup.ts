import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import { server } from './msw/server'

expect.extend(toHaveNoViolations)

// jsdom implements no layout, so it has no `scrollIntoView`. Components that
// position themselves are entitled to call it.
Element.prototype.scrollIntoView = vi.fn()

// `error` so a request no handler covers fails loudly instead of reaching the
// real network and timing out somewhere confusing.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { afterEach, expect, vi } from 'vitest'

expect.extend(toHaveNoViolations)

// jsdom implements no layout, so it has no `scrollIntoView`. Components that
// position themselves are entitled to call it.
Element.prototype.scrollIntoView = vi.fn()

afterEach(() => {
  cleanup()
})

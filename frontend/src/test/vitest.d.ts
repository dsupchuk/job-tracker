import 'vitest'

/**
 * `@types/jest-axe` only augments Jest's matchers, so Vitest needs telling that
 * `toHaveNoViolations` exists after `expect.extend` in `setup.ts`.
 */
declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}

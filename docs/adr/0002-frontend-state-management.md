# ADR 0002 — Redux Toolkit for client state, TanStack Query for server state

- **Status:** Accepted
- **Date:** 2026-09-14
- **Phase:** 3 (Frontend Skeleton)

## Context

The original plan put auth in a React `AuthContext` and everything server-shaped in TanStack
Query. Redux Toolkit was added to the stack afterwards, which raised the obvious question of
what it should own — including whether RTK Query should replace TanStack Query outright.

## Decision

Redux Toolkit owns **client state**. TanStack Query owns **server state**. Nothing is mirrored
across the boundary.

| State | Owner |
|---|---|
| Access/refresh tokens, current user, auth status | `authSlice` |
| Light/dark theme | `themeSlice` |
| Table search, status filters, sidebar and drawer state | `uiSlice` |
| Applications list and detail, every mutation | TanStack Query cache |

RTK Query was rejected: the Kanban board in Phase 5 is built around TanStack Query's optimistic
update and rollback model, and swapping the cache layer would buy no capability the project
needs.

## Consequences

- The access token lives in the Redux store **in memory only**. The refresh token is persisted
  to `localStorage` by a listener middleware, so a reload can restore the session via
  `/api/auth/refresh` while the app shows a `bootstrapping` state.
- Persistence is a `createListenerMiddleware` listener rather than a reducer side effect, so
  reducers stay pure and testable as plain functions.
- The Axios request interceptor reads the token from `store.getState()` rather than from
  module-level state, so there is one source of truth and no cycle between `store` and `api`.
- Signing out dispatches `loggedOut` **and** calls `queryClient.clear()` — without the second
  step the next user would briefly see the previous user's cached data.
- Slice reducers are unit-testable without React; components get a fresh store per test via a
  `renderWithProviders` helper in Phase 7.

## Related stack notes

- **Tailwind CSS v4** is configured through the `@tailwindcss/vite` plugin with a single
  `@import 'tailwindcss'` in `src/index.css` — there is no `tailwind.config.js`. Theme tokens
  are CSS custom properties, and dark mode is a `dark` class on `<html>` driven by `themeSlice`.
- **Zod v4** exposes `z.email()` as a top-level function; the v3 `z.string().email()` form is
  deprecated.
- `@` is aliased to `src/` in both `vite.config.ts` and `tsconfig.app.json`. The alias is
  declared with `paths` only — `baseUrl` is deprecated in TypeScript 6.

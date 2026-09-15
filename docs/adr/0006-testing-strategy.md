# ADR 0006 — Testing strategy

- **Status:** Accepted
- **Date:** 2026-09-15
- **Phase:** 7 (Testing and CI)

## Context

Up to this phase the backend had one context-load test and an error-contract
test that ran against **the developer's own database** — registering accounts in
it and deleting them again in `@AfterAll`. That is fragile (a failed run leaves
rows behind), order-dependent (it asserted on seeded ids) and impossible in CI.

## Decisions

### 1. Testcontainers, not H2
Integration tests start a real `postgres:16` and let Flyway migrate it exactly as
production is migrated. H2 would not survive contact with this schema: `V3` splits
company out of the position string with `split_part`, the tables use
`GENERATED ALWAYS AS IDENTITY`, and timestamps are `TIMESTAMPTZ`. A test suite
that passes on a database you do not ship is worth very little.

`IntegrationTest` is the shared base. Spring caches the context across classes, so
the image starts once per build — the first class pays ~25s, the rest ~2s each.

The container configuration is a **top-level** `@TestConfiguration`, not one
nested in the base class: a nested one is also picked up as a default
configuration class, so importing it as well registers it twice. Spring currently
ignores the duplicate and warns; from Framework 7.1 it will not.

### 2. Tests own their data
`TestAccounts.register` creates a throwaway account through the real auth
endpoints. No test asserts on seeded ids, and the `test` profile keeps
`DataSeeder` out entirely. Nothing needs cleaning up afterwards because nothing
shared is touched.

### 3. Mockito where a database adds nothing
`ApplicationServiceTest` covers the rules that are pure logic: a status move
records a transition, a move to the *same* status records nothing, creating
writes the opening entry, and every ownership check refuses before touching the
repository. These run in milliseconds and fail with a readable message.

### 4. No `@WebMvcTest` slice
The plan called for one. `ErrorContractTest` already asserts controller
validation and the error shape through the full stack against the warm container,
so a slice would add a **second** Spring context for assertions we already make —
slower overall, for duplicate coverage. Skipped deliberately.

### 5. MSW for the HTTP layer, module mocks for cache logic
Two different things need testing and they want different tools.

The Axios interceptor — attach token, 401, refresh once, replay — is only real
over HTTP, so `api/client.test.ts` uses MSW and exercises the actual instance.
This closes a gap left open since Phase 3: the refresh-and-retry branch had never
been executed, because a local round trip is too fast to catch by polling in a
browser.

The optimistic-update tests keep mocking the api module, because what they assert
is cache mutation and rollback, and a controllable promise is the clearest way to
hold a request mid-flight.

MSW runs with `onUnhandledRequest: 'error'`, so a request no handler covers fails
loudly instead of escaping to the network.

## What this turned up

**Both persisted slices read `localStorage` when their module first loaded**, not
when a store was created. In the app that is invisible — there is one store, made
once. In a test it means `createStore()` cannot reflect storage you just set, and
a second store would silently carry the first one's state. Both now use a lazy
initialiser.

## Consequences

- CI needs a Docker daemon for the backend job. GitHub's `ubuntu-latest` runner
  has one, so no service container and no credentials duplicated from
  `application.yml`.
- Coverage today: frontend 73.9% of lines, backend 71.6%. The backend's branch
  coverage (48%) is the weak spot — mapper and DTO branches are largely untested.
- Branch protection is a repository setting and cannot be committed. It is the
  one item of Phase 7 that has to be clicked in GitHub.

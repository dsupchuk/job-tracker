# ADR 0003 — Form engine and applications table deviations

- **Status:** Accepted
- **Date:** 2026-09-14
- **Phase:** 4 (List and Form Engine)

## Context

Phase 4 built the applications table and the schema-driven form engine. Three things
differed from what the plan assumed.

## Decisions

### 1. TanStack Table v9, not v8
npm now resolves `@tanstack/react-table` to **9.2.4**, whose API is a rewrite. Features and
row models are registered explicitly with `tableFeatures({ … })` instead of being switched on
with `getCoreRowModel()` / `getSortedRowModel()` options, and column definitions must be
wrapped in `helper.columns([...])` to keep each column's value type. A `./legacy` entry point
offers the v8 API but is deprecated on arrival, so we use v9 directly.

Two consequences worth remembering:

- `row.getVisibleCells()` belongs to `columnVisibilityFeature`, which we do not register.
  With only the features we use, the core accessor is `row.getAllCells()`.
- The built-in `arrIncludesSome` filter expects the **cell** to hold an array. The status
  filter is the opposite shape — a scalar cell against a list of selected values — so the
  table registers a small custom `oneOf` filter function in the `filterFns` slot.

### 2. `company` as a denormalized column, not a `companies` table
The plan's table lists a company column and its async-validation example is "check for a
duplicate application at the same company", but `V1__init.sql` had no company anywhere — the
seeded data encoded it inside the position string (`"Backend Engineer @ Stripe"`), so it could
not be sorted, filtered or matched on.

`V3__application_company.sql` adds a plain `company TEXT` column to `applications` and splits
the existing rows on `" @ "`, leaving `position` as the role alone. The full `companies` table
sketched in `docs/schema.md` was deliberately **not** built: it would add an entity, repository,
service, controller and an autocomplete in the form, and nothing yet needs a company to carry
data of its own. Promote it when a company needs a website, notes, or to be shared across
applications.

With the column in place the async validator checks **position + company** together, reading
the applications already in the query cache rather than issuing another request. The same role
at a different company is a distinct application, which the old position-only check could not
express.

### 3. Form engine: two extensions to the sketched schema
- `visibleIf` accepts `oneOf: unknown[]` alongside `equals`. The real condition in the
  application form is "status is any of the sent statuses", which `equals` alone cannot express.
- Async validators are referenced **by name** through `asyncValidatorRegistry` rather than
  embedded as functions, so a schema stays JSON-serialisable and could be served by the API.
  The data they need that the form does not own is threaded in as a `validationContext`.

The application form uses `mode: 'single'` — every step rendered as a section on one page —
because eight fields do not warrant a wizard. `mode: 'wizard'` with per-step validation is
implemented and covered by a unit test.

## Consequences

- Hidden fields cannot block submit: the Zod schema is rebuilt per validation run from only
  the fields visible for the values being validated, so their values are also stripped from
  the parsed result.
- A field that is hidden and shown again returns as `undefined`, because `unregister` dropped
  its value. Every generated field schema normalises `undefined` to its own empty value first,
  so such a field reports "is required" rather than a Zod type error.
- The submit button is **not** disabled while validating. Async rules re-run on every
  keystroke, and a button that flickers disabled silently swallows clicks.
- A rejected save keeps the dialog open with the user's input; only a successful one closes it.
- A rule spanning two fields needs `revalidateOn`. React Hook Form only refreshes the error of
  the field being edited, so the duplicate message on `position` survived changing `company`
  until it became stale. `revalidateOn: ['company']` on the position field re-triggers it —
  but only while it is already showing an error, so editing one field never surfaces errors on
  untouched ones.
- Anything touching the DTO records needs a **clean** backend rebuild. MapStruct's generated
  `ApplicationMapperImpl` is compiled against the record's constructor, and a stale one fails
  at runtime with `Unresolved compilation problem: The constructor … is undefined`.

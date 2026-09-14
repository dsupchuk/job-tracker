# ADR 0004 — Kanban board, status moves and the audit trail

- **Status:** Accepted
- **Date:** 2026-09-14
- **Phase:** 5 (Kanban Board)

## Context

Dragging a card between columns changes one field. Doing that through the existing
`PUT /api/applications/{id}` would make the board send a full replacement of every field it
does not own, and would lose the reason the change happened.

## Decisions

### 1. A dedicated `PATCH /{id}/status`
The board sends `{ "status": "INTERVIEW" }` and nothing else. `PUT` stays a full replacement
for the form. The service records the transition and then applies it, so history and state can
never disagree.

### 2. `status_history` is append-only, and starts at creation
`V4__status_history.sql` adds the table and backfills an opening row for every existing
application (`from_status` null, `changed_at` = the application's `created_at`), so no timeline
begins mid-story. Rows are written by `create`, by `update` when the status actually changes,
and by `changeStatus`; a no-op move writes nothing. Moving a card out and back records both
transitions — that is the point of an audit trail, not a bug.

### 3. Card order is derived, so cards are draggable rather than sortable
The data model has no notion of order within a column. Rather than offer a reorder that would
silently snap back on the next refetch, the board derives one: `sortColumn` puts whatever has
been waiting longest at the top (`appliedAt` ascending, applications with no applied date last,
ties broken on id so the order never wobbles between renders).

Cards therefore use `useDraggable`, not `useSortable`, and there is no `SortableContext`. A card
only ever changes column; dropping one back where it started sends no request at all.

### 4. Left/right jump columns — a custom keyboard coordinate getter
dnd-kit's default getter nudges by a fixed pixel step and has no notion of columns, so a card
could not be moved across a board with the keyboard. `boardCoordinateGetter` handles the
horizontal axis itself: it finds the column rects, works out which one the card is currently
over from its horizontal centre, and returns the centre of the neighbour. Up and down do
nothing on purpose — with order derived, they have nothing to change.

Announcements go through dnd-kit's own `accessibility.announcements` rather than a hand-rolled
`aria-live` region, so lift, move, drop and cancel are all narrated from one place.

### 5. The drag handle and the details button are siblings
dnd-kit puts `role="button"` on the drag handle. Nesting the details control inside it would
leave the inner one unreachable for assistive technology, so the details button sits beside the
handle in the same `<li>` and both are reachable with Tab.

## An unrelated bug this phase surfaced

`PATCH` with an unknown enum value returned **401**, not 400. Spring resolved the
`HttpMessageNotReadableException` to a 400 and then *forwarded to `/error`* to render the body —
and `/error` was not in the security chain's public paths, so the entry point rewrote the
response as `UNAUTHENTICATED`.

This affected every endpoint, not just the new one: any malformed body looked like an expired
token, and the frontend's response interceptor would answer a client mistake by trying to
refresh the session and replaying the request. Fixed on both sides — an explicit
`HttpMessageNotReadableException` handler returning `MALFORMED_REQUEST`, and `/error` added to
`PUBLIC_PATHS` so a forward can never be reinterpreted as an auth failure.

Permitting `/error` fixed the statuses but left the *bodies* wrong. Exceptions Spring MVC
raises itself — unknown route, unsupported method, unsupported media type, a path variable that
will not parse — were still rendered in Spring's own `{timestamp, status, error, path}` shape,
which carries neither `code` nor `message`, so the frontend's `apiErrorMessage` found nothing to
show and fell back to generic text. `GlobalExceptionHandler` now extends
`ResponseEntityExceptionHandler` and overrides `handleExceptionInternal` to swap in an
`ApiError` while keeping the status Spring chose, plus a catch-all for anything unforeseen
(logged in full, reported without internals).

`ErrorContractTest` locks all of this in: malformed JSON, an unknown enum constant, a failed
constraint, an unknown route, an unsupported method and media type, a missing token, another
user's id, and bad credentials.

## Consequences

- Reordering within a column is neither offered nor persisted; only moves between columns hit
  the API.
- The board and the table share one query (`applications.listAll`), so a move made on either is
  reflected on the other without a refetch.
- A successful move invalidates that application's timeline, which is otherwise cached.
- Every error response now carries `code` and `message`. Clients can branch on `code` rather
  than parsing prose.

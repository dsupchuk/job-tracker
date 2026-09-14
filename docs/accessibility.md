# Accessibility

The target is WCAG 2.1 AA. This is what was built to get there, what is checked
automatically, and what is still open.

---

## Automated checks

| Check | Where | What it asserts |
|---|---|---|
| `jest-axe` | `src/test/accessibility.test.tsx` | Zero violations on the table and toolbar, the board, the application form, the form in its error state, the open date picker, and the login page |
| Contrast | `src/test/contrast.test.ts` | Every foreground/background pair the interface renders clears 4.5:1, in **both** themes |
| Keyboard model | `src/components/ui/DatePicker.test.tsx` | Arrow/Home/End/PageUp/PageDown movement, Enter to select, Escape to cancel, focus return, focus trap, range limits |

`npm run test` runs all of them.

The contrast test parses the oklch tokens straight out of `src/index.css` and
converts them to linear sRGB, so it audits the palette as authored rather than
whatever a screenshot happened to capture. The narrowest pair is
`content-muted` on `surface-muted` at **5.2:1**; everything else has more room.

---

## The date picker

Built rather than installed, because its keyboard and screen-reader behaviour
is the part worth owning. `src/components/ui/DatePicker.tsx`.

- The trigger carries `aria-haspopup="dialog"` and `aria-expanded`.
- The calendar is a `role="grid"` of `role="row"` / `role="gridcell"`, labelled
  by the visible month.
- **Roving tabindex**: exactly one day is tabbable, so Tab leaves the grid
  instead of walking 42 cells.
- Movement: arrows by day and week, `Home`/`End` to the week bounds,
  `PageUp`/`PageDown` by month. `Enter` or `Space` selects. `Escape` closes
  without selecting.
- The month name sits in an `aria-live="polite"` region, so paging is announced.
- Focus is trapped while the popup is open and returned to the trigger on close.
- `minDate` / `maxDate` come from the field schema. Out-of-range days are
  `aria-disabled` and navigation will not cross the bound.

One subtlety worth recording: a `<label for>` names the trigger button and
**overrides its own contents**, so the chosen date would never be announced.
The picker therefore exposes the selected date through `aria-describedby`,
which is read after the name.

---

## Patterns used throughout

**Structure is announced, not just drawn.** The funnel is an ordered position
rendered as filled segments, and the segments are `aria-hidden` — the stage name
is real text beside them, so nothing depends on seeing the bars. Likewise the
waiting meter is decorative; the day count next to it carries the value.

**Every control is reachable.** Opening an application is a button in the
position cell, not a click handler on the `<tr>`. A table row cannot take focus,
so a row-level `onClick` would have made the editor mouse-only — a WCAG 2.1.1
failure that the automated sweep missed because React handlers are invisible to
an `[onclick]` selector.

**Nested controls are avoided.** dnd-kit puts `role="button"` on a board card's
drag handle, so the details control sits beside it in the same `<li>` rather
than inside it, where assistive technology could not reach it.

**Errors are connected to their fields.** An invalid field gets `aria-invalid`
and an `aria-describedby` pointing at its message; required fields get
`aria-required`, and the visual asterisk is outside the `<label>` so the label's
text stays exactly the field name.

**Motion is opt-out.** `prefers-reduced-motion: reduce` collapses every
animation and transition to 0.01ms.

**Focus is always visible.** A single `:focus-visible` rule paints a 2px brass
outline with an offset; nothing removes it.

---

## Drag and drop

The board is fully operable from the keyboard — the requirement that shaped the
implementation. Space or Enter lifts a card, left/right move it between columns,
Space drops it, Escape cancels. Up/down deliberately do nothing: order within a
column is derived rather than stored, so there is nothing for them to change.

dnd-kit's default coordinate getter nudges by a fixed pixel step and has no
notion of columns, so `boardCoordinateGetter` handles the horizontal axis
itself. Announcements go through dnd-kit's own `accessibility.announcements`,
covering lift, move, drop and cancel from one place.

---

## Still open

- **No manual screen-reader pass yet.** `jest-axe` catches roughly a third of
  WCAG issues; it cannot judge whether an announcement is *useful*. NVDA and
  VoiceOver runs are outstanding.
- **The table scrolls sideways on a phone.** Seven columns cannot usefully
  shrink to 390px, so the region keeps a readable width and scrolls. That is a
  deliberate trade, not an oversight, but a card layout below `sm` would serve
  a phone better.
- **`jest-axe` runs on components, not routes.** Once MSW lands in Phase 7 the
  same assertions should run against whole pages, including their loading and
  empty states.

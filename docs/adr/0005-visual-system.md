# ADR 0005 — Visual system: time is the signal, colour is earned

- **Status:** Accepted
- **Date:** 2026-09-14
- **Phase:** 6 (built alongside the accessibility work, which touches the same files)

## Context

Phases 3–5 were built for function, and the result looked like what it was: an
unstyled Tailwind application. No typeface was ever chosen, so the app used the
system stack and had no tabular figures — in an interface made of salaries,
dates and day counts, columns visibly failed to line up. Statuses were six
pastel chips from Tailwind's default palette. One border radius and one shadow
sat on every surface, so a table row, a card and a modal all read as equally
important.

None of that was a decision. It was the absence of one.

## What the product is actually about

A job search is mostly **waiting**, and the useful daily question is "what has
gone quiet?". The data already answers it: `appliedAt`, days elapsed, the status
timeline, and a board that sorts by longest wait. So time became the primary
visual variable, and everything else got quieter to let it show.

## Decisions

### 1. The funnel is drawn as a position, not coloured as a category
Six colour chips implied six equal categories. They are not — they are an
ordered progression. `StageIndicator` renders four segments that fill as an
application advances, in ink. A rejection leaves the progression entirely: its
segments stay empty and the label is struck through.

The bars are `aria-hidden`; the stage name beside them is real text, so nothing
depends on seeing them.

### 2. Colour is spent in one place
Brass (`--brand`) marks an **offer** and the primary action. Red marks an error.
Everything else — every category, every piece of structure — is ink on paper.
The palette is cool: a green-grey ground with slate-green ink, deliberately not
the warm-cream-plus-terracotta or near-black-plus-acid-green that generated
designs cluster around.

A stalled application was originally going to earn colour too. It does not: the
waiting meter fills completely and the word "stalled" appears in full-weight
ink. Keeping brass unambiguous is worth more than a second accent.

### 3. Waiting is a bar, not a sentence
`AgeMeter` replaces "44 days since applying" with a short bar that fills toward
60 days, plus a compact `44d`. It is read peripherally rather than parsed.

### 4. One typeface, hierarchy from weight and size
Archivo, self-hosted through `@fontsource-variable/archivo`. One family with a
wide weight range instead of a display/body pair. A `.numeric` utility turns on
tabular figures wherever money, dates or counts appear, so columns align.

The type scale is six named steps (`meta`, `data`, `body`, `lead`, `title`,
`display`) declared as Tailwind tokens, so sizes are chosen from a scale rather
than sprinkled ad hoc.

### 5. Radius encodes weight
Three values, not one: `--radius-data` (3px) for dense controls,
`--radius-card` (7px) for cards and panels, `--radius-overlay` (12px) for
dialogs. The uniform soft shadow under everything is gone.

### 6. The sidebar carries the funnel
It held three links and a large empty area. It now also shows where everything
stands, so navigation and state sit together.

## Things this turned up

- **Empty states were placeholders.** They are now written as invitations with
  somewhere to go, and the demo credentials on the login page became a
  **Try the demo** button instead of grey text to retype by hand.
- **A flex item will not shrink by default.** The stage filter had
  `max-w-full overflow-x-auto` and still pushed the page sideways on a phone,
  because flex items default to `min-width: auto`. `min-w-0` is load-bearing.
- **A scrollbar squares off the corner it overlaps.** `overflow-y-auto` on the
  rounded `<dialog>` itself painted over its own radius; the radius and clip now
  live on the dialog and the scrolling on an inner box.
- **Section headings can restate their contents.** The form had a heading
  "Role" directly above a field labelled "Position". The form is one step now.
- **A total can be decoration.** The board column header summed salary ranges.
  Summing the hypothetical pay of jobs you do not have answers no question, and
  in the Rejected column it is worse than useless. Only the count remains.

## Consequences

- A data table cannot shrink to a phone; it keeps a readable width and its
  region scrolls sideways. A card layout below `sm` would serve a phone better
  and is noted in `docs/accessibility.md`.
- Every token pair is contrast-checked in code against WCAG AA, in both themes
  — see `src/test/contrast.test.ts`. The narrowest pair sits at 5.2:1.

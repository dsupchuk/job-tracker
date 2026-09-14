import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  fromIso,
  isOutOfRange,
  isSameDay,
  isSameMonth,
  monthGrid,
  startOfWeek,
  toIso,
  WEEKDAY_LABELS,
} from '@/lib/calendar'

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const DAY_LABEL = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const TRIGGER_LABEL = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export type DatePickerProps = {
  /** ISO `yyyy-mm-dd`, or an empty string for no date. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  inputId: string
  describedBy?: string | undefined
  invalid?: boolean
  required?: boolean
  min?: string | undefined
  max?: string | undefined
}

function focusableIn(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ]
}

/**
 * A date picker built rather than installed, because the keyboard and screen
 * reader behaviour is the point: a grid you can drive with the arrow keys, a
 * month change that is announced, and focus that goes back where it came from.
 */
export function DatePicker({
  value,
  onChange,
  onBlur,
  inputId,
  describedBy,
  invalid = false,
  required = false,
  min,
  max,
}: DatePickerProps) {
  const dialogId = useId()
  const labelId = `${dialogId}-month`
  const valueId = `${dialogId}-value`

  const minDate = fromIso(min)
  const maxDate = fromIso(max)
  const selected = fromIso(value)

  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<'below' | 'above'>('below')
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => selected ?? clampDate(new Date(), minDate, maxDate),
  )

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const focusedCellRef = useRef<HTMLTableCellElement>(null)

  /** Closing always hands focus back to the control that opened the popup. */
  function close({ restoreFocus = true }: { restoreFocus?: boolean } = {}) {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function openPicker() {
    setFocusedDate(selected ?? clampDate(new Date(), minDate, maxDate))
    setOpen(true)
  }

  /**
   * Open upwards when the calendar would not fit below the trigger. Measured
   * rather than guessed, because the field sits inside a scrolling dialog whose
   * remaining space depends on where the user has scrolled to.
   */
  useLayoutEffect(() => {
    if (!open || !popupRef.current || !triggerRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const needed = popupRef.current.offsetHeight + 8
    const spaceBelow = window.innerHeight - trigger.bottom
    const spaceAbove = trigger.top

    setPlacement(spaceBelow < needed && spaceAbove > spaceBelow ? 'above' : 'below')
  }, [open])

  /**
   * Bring the calendar fully into view once, after its side is decided.
   * Doing it explicitly — rather than letting `focus()` scroll — keeps the two
   * from fighting: focus-induced scrolling moves the trigger, which would leave
   * a popup that was correctly placed a moment ago hanging off the screen.
   */
  useEffect(() => {
    if (open) popupRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open, placement])

  // Move DOM focus to whichever day is currently focused in the grid.
  useEffect(() => {
    if (open) focusedCellRef.current?.focus({ preventScroll: true })
  }, [open, placement, focusedDate])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (popupRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      // A click elsewhere dismisses without stealing focus back.
      close({ restoreFocus: false })
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function moveTo(date: Date) {
    setFocusedDate(clampDate(date, minDate, maxDate))
  }

  function select(date: Date) {
    if (isOutOfRange(date, minDate, maxDate)) return
    onChange(toIso(date))
    close()
    onBlur?.()
  }

  function handleGridKeyDown(event: ReactKeyboardEvent<HTMLTableElement>) {
    const handlers: Record<string, () => void> = {
      ArrowLeft: () => moveTo(addDays(focusedDate, -1)),
      ArrowRight: () => moveTo(addDays(focusedDate, 1)),
      ArrowUp: () => moveTo(addDays(focusedDate, -7)),
      ArrowDown: () => moveTo(addDays(focusedDate, 7)),
      Home: () => moveTo(startOfWeek(focusedDate)),
      End: () => moveTo(endOfWeek(focusedDate)),
      PageUp: () => moveTo(addMonths(focusedDate, -1)),
      PageDown: () => moveTo(addMonths(focusedDate, 1)),
      Enter: () => select(focusedDate),
      ' ': () => select(focusedDate),
    }

    const handler = handlers[event.key]
    if (!handler) return

    event.preventDefault()
    handler()
  }

  /** Tab stays inside the popup for as long as it is open. */
  function handlePopupKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab' || !popupRef.current) return

    const focusable = focusableIn(popupRef.current)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const weeks = monthGrid(focusedDate)
  const monthLabel = MONTH_LABEL.format(focusedDate)
  const today = new Date()

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        onBlur={onBlur}
        aria-haspopup="dialog"
        aria-expanded={open}
        // A `<label for>` names this button, overriding its own contents — so
        // the chosen date has to reach assistive technology as a description,
        // or the control announces its label and never its value.
        aria-describedby={[valueId, describedBy].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className="border-border-subtle bg-surface text-content rounded-data text-data aria-invalid:border-danger w-full border px-3 py-2 text-left"
      >
        {selected ? (
          <span className="numeric">{TRIGGER_LABEL.format(selected)}</span>
        ) : (
          <span className="text-content-muted">Choose a date</span>
        )}
      </button>

      <span id={valueId} className="sr-only">
        {selected ? DAY_LABEL.format(selected) : 'No date chosen'}
      </span>

      {open && (
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          onKeyDown={handlePopupKeyDown}
          className={`border-border-subtle bg-surface rounded-card absolute z-50 w-[17.5rem] border p-3 shadow-lg ${
            placement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveTo(addMonths(focusedDate, -1))}
              className="text-content-muted hover:text-content rounded-data px-2 py-1"
            >
              <span aria-hidden="true">←</span>
              <span className="sr-only">Previous month</span>
            </button>

            <span id={labelId} className="text-content text-data font-semibold">
              {monthLabel}
            </span>

            <button
              type="button"
              onClick={() => moveTo(addMonths(focusedDate, 1))}
              className="text-content-muted hover:text-content rounded-data px-2 py-1"
            >
              <span aria-hidden="true">→</span>
              <span className="sr-only">Next month</span>
            </button>
          </div>

          {/* Announces the month on every change, including keyboard paging. */}
          <span aria-live="polite" className="sr-only">
            {monthLabel}
          </span>

          <table role="grid" aria-labelledby={labelId} onKeyDown={handleGridKeyDown}>
            <thead>
              <tr role="row">
                {WEEKDAY_LABELS.map((weekday) => (
                  <th
                    key={weekday}
                    role="columnheader"
                    abbr={weekday}
                    className="text-content-muted text-meta w-9 pb-1 font-semibold"
                  >
                    {weekday.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={toIso(week[0] as Date)} role="row">
                  {week.map((day) => {
                    const isFocused = isSameDay(day, focusedDate)
                    const isSelected = selected !== null && isSameDay(day, selected)
                    const disabled = isOutOfRange(day, minDate, maxDate)
                    const outsideMonth = !isSameMonth(day, focusedDate)

                    return (
                      <td
                        key={toIso(day)}
                        ref={isFocused ? focusedCellRef : undefined}
                        role="gridcell"
                        // Roving tabindex: exactly one day is tabbable, so Tab
                        // leaves the grid instead of walking 42 cells.
                        tabIndex={isFocused ? 0 : -1}
                        aria-selected={isSelected}
                        aria-disabled={disabled || undefined}
                        aria-current={isSameDay(day, today) ? 'date' : undefined}
                        aria-label={DAY_LABEL.format(day)}
                        onClick={() => !disabled && select(day)}
                        className={`numeric text-data h-9 cursor-pointer text-center align-middle ${
                          isSelected
                            ? 'bg-brand text-brand-contrast font-semibold'
                            : disabled
                              ? 'text-content-muted cursor-not-allowed opacity-40'
                              : outsideMonth
                                ? 'text-content-muted hover:bg-surface-muted'
                                : 'text-content hover:bg-surface-muted'
                        }`}
                      >
                        {day.getDate()}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {value !== '' && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                close()
              }}
              className="text-content-muted hover:text-content text-meta mt-2 underline underline-offset-4"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}

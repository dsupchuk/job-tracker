import { daysSince } from './format'

/** Past this, an application has been waiting long enough to act on. */
const STALE_DAYS = 45
const FULL_AT_DAYS = 60

/**
 * How long an application has been waiting, as a bar rather than a sentence.
 * Waiting is the thing a job search is mostly made of, so it gets read at a
 * glance instead of parsed out of "44 days since applying".
 *
 * Deliberately monochrome: brass means an offer, and nothing else may borrow it.
 * A stalled application is marked by a full bar and a plain word.
 */
export function AgeMeter({ appliedAt }: { appliedAt: string | null }) {
  const days = daysSince(appliedAt)
  if (days === null) return null

  const fill = Math.min(Math.max(days / FULL_AT_DAYS, 0.06), 1)
  const stalled = days >= STALE_DAYS

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="bg-border-subtle h-[3px] w-10 overflow-hidden rounded-[1px]"
      >
        <span
          className={`block h-full ${stalled ? 'bg-content' : 'bg-content-muted'}`}
          style={{ width: `${fill * 100}%` }}
        />
      </span>
      <span className="text-meta inline-flex items-baseline gap-1.5">
        <span className="text-content-muted numeric">{days <= 0 ? 'today' : `${days}d`}</span>
        {stalled && <span className="text-content font-semibold">stalled</span>}
      </span>
    </span>
  )
}

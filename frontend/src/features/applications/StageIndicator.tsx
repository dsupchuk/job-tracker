import type { ApplicationStatus } from '@/api/types'
import { FUNNEL_STEPS, STATUS_META } from './statusMeta'

/**
 * Position in the funnel, drawn rather than colour-coded: four segments fill as
 * an application advances. A colour chip per status would look like six equal
 * categories, which is exactly what they are not.
 *
 * Only an offer earns colour. A rejection leaves the progression, so its
 * segments stay empty and its label is struck through.
 */
export function StageIndicator({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status]
  const isOffer = status === 'OFFER'

  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="flex gap-[2px]">
        {Array.from({ length: FUNNEL_STEPS }, (_, index) => {
          const filled = index < meta.step
          return (
            <span
              key={index}
              className={`h-[3px] w-2.5 rounded-[1px] ${
                filled ? (isOffer ? 'bg-brand' : 'bg-content') : 'bg-border-subtle'
              }`}
            />
          )
        })}
      </span>

      <span
        className={`text-data ${
          meta.out
            ? 'text-content-muted line-through decoration-1'
            : isOffer
              ? 'text-brand font-semibold'
              : 'text-content'
        }`}
      >
        {meta.label}
      </span>
    </span>
  )
}

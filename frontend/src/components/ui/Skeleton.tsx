export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-surface-muted animate-pulse rounded-md ${className}`} />
}

/** Placeholder for a list or table while its query is loading. */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}

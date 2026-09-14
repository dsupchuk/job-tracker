import { EmptyState } from '@/components/ui/EmptyState'

export function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-title font-semibold tracking-tight">Analytics</h1>
      <EmptyState
        title="Conversion funnel"
        description="How far applications get, and how long each stage takes. Built in Phase 9."
      />
    </section>
  )
}

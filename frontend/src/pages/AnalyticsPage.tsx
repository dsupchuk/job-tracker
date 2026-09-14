import { EmptyState } from '@/components/ui/EmptyState'

export function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-lg font-semibold">Analytics</h1>
      <EmptyState title="Conversion funnel" description="Built in Phase 9 with Recharts." />
    </section>
  )
}

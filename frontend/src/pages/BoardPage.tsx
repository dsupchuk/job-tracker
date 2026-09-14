import { EmptyState } from '@/components/ui/EmptyState'

export function BoardPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-content text-lg font-semibold">Board</h1>
      <EmptyState title="Kanban board" description="Built in Phase 5 with dnd-kit." />
    </section>
  )
}

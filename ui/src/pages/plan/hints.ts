import type { CatalogCase } from "@/lib/api"

export function planHints(selected: readonly CatalogCase[]) {
  const groups = new Map<string, string[]>()
  const selectedIds = new Set(selected.map((item) => item.id))
  for (const item of selected) {
    const keys = [...new Set([item.mutex, ...(item.resources || [])].filter(Boolean))]
    for (const key of keys) groups.set(key, [...(groups.get(key) || []), item.id])
  }
  return {
    typical: selected.reduce((sum, item) => sum + (item.typical_s || 0), 0),
    conflicts: [...groups.entries()].filter(([, ids]) => new Set(ids).size > 1),
    after: selected.flatMap((item) => (item.prefer_after || [])
      .filter((id) => selectedIds.has(id)).map((id) => `${id} → ${item.id}`)),
  }
}
export type PlanHints = ReturnType<typeof planHints>

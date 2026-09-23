import { ErrorAlert } from "@/components/error-alert"
import { useResource } from "@/hooks/use-resource"
import { loadCatalog } from "@/lib/load-catalog"
import { t } from "@/lib/i18n"
import { usePlanIds } from "@/lib/plan"
import { CatalogPanel } from "./plan/catalog-panel"
import { ConfigPanel } from "./plan/config-panel"
import { planHints } from "./plan/hints"
import { PLAN_GRID } from "./plan/layout"
import { planText } from "./plan/messages"
import { SelectedPanel } from "./plan/selected-panel"
import { PlanSkeleton } from "./plan/skeleton"

export function PlanPage() {
  const ids = usePlanIds()
  const { data: catalog, loading, error } = useResource(loadCatalog)
  const selectedIds = new Set(ids)
  const selected = (catalog?.items || []).filter((item) => selectedIds.has(item.id))
  const hints = planHints(selected)
  return <div className="space-y-6">
    <div className="space-y-1">
      <h1 className="text-lg font-medium">{t("plan")}</h1>
      <p className="text-sm text-muted-foreground">{planText.intro}</p>
    </div>
    {error ? <ErrorAlert>{error}</ErrorAlert> : null}
    {loading ? <PlanSkeleton /> : catalog ? <div className={PLAN_GRID}>
      <CatalogPanel items={catalog.items} ids={ids} />
      <SelectedPanel items={catalog.items} ids={ids} hints={hints} />
      <ConfigPanel ids={ids} envs={catalog.envs} hints={hints} />
    </div> : null}
  </div>
}

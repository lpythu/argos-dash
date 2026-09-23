import { Link } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import type { CatalogCase } from "@/lib/api"
import { fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { clearPlan, togglePlan } from "@/lib/plan"
import type { PlanHints } from "./hints"
import { LIST_CARD, LIST_CONTENT, LIST_SCROLL } from "./layout"
import { planText } from "./messages"

type SelectionProps = { ids: readonly string[]; items: readonly CatalogCase[]; hints: PlanHints }

export function SelectedPanel({ ids, items, hints }: SelectionProps) {
  const catalog = new Map(items.map((item) => [item.id, item]))
  return <Card className={LIST_CARD}><CardContent className={LIST_CONTENT}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><CardTitle>{planText.selection}</CardTitle>
        <Badge variant="secondary">{ids.length}</Badge></div>
      <Button variant="ghost" size="sm" disabled={!ids.length} onClick={clearPlan}>{planText.clearAll}</Button>
    </div>
    <div className={LIST_SCROLL}>
      {ids.length ? <ul className="space-y-2" aria-label={planText.selection}>
        {ids.map((id) => <SelectedItem key={id} id={id} item={catalog.get(id)} />)}
      </ul> : <p className="py-8 text-sm text-muted-foreground">{t("emptyPlan")}</p>}
      <PlanningNotes hints={hints} />
    </div>
    <Link to="/cases" className="text-sm text-link">{t("goCases")}</Link>
  </CardContent></Card>
}

function SelectedItem({ id, item }: { id: string; item?: CatalogCase }) {
  return <li className="flex items-start gap-2 rounded-lg border p-3">
    <div className="min-w-0 flex-1 space-y-1">
      <p className="text-sm font-medium wrap-anywhere">{item?.title || id}</p>
      <code className="block text-xs text-muted-foreground wrap-anywhere">{id}</code>
      <p className="text-xs text-muted-foreground wrap-anywhere">
        {item ? `${item.pack} · ${t("typical")}: ${item.typical_s ? fmtDur(item.typical_s) : "—"}` : planText.missing}
      </p>
    </div>
    <Button variant="ghost" size="sm" className="shrink-0" aria-label={`${planText.remove} ${id}`}
      onClick={() => togglePlan(id)}>{planText.remove}</Button>
  </li>
}

function PlanningNotes({ hints }: { hints: PlanHints }) {
  if (!hints.conflicts.length && !hints.after.length) return null
  return <Alert className="mt-4">
    <AlertTitle>{planText.checks}</AlertTitle>
    <AlertDescription className="space-y-2 wrap-anywhere">
      {hints.conflicts.map(([key, ids]) => <p key={key} className="text-destructive">
        {t("conflict")}: {key} · {ids.join(", ")}
      </p>)}
      {hints.after.map((order) => <p key={order}>{t("preferAfter")}: {order}</p>)}
    </AlertDescription>
  </Alert>
}

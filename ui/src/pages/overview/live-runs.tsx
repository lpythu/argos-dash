import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { LiveRun } from "@/lib/api"
import { fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { statusVariant } from "@/lib/status"
import { Activity } from "lucide-react"
import { Link } from "react-router-dom"

export function LiveRunsPanel({ runs }: { runs: readonly LiveRun[] }) {
  return (
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-medium"><Activity aria-hidden="true" className="size-4" />{t("liveRuns")}</h2>
        <Badge variant={runs.length ? "running" : "secondary"}>{runs.length}</Badge>
      </div>
      {runs.length ? (
        <ul className="divide-y">{runs.map((run) => <LiveRunItem key={run.id} run={run} />)}</ul>
      ) : <p className="py-2 text-sm text-muted-foreground">{t("emptyLive")}</p>}
      <div className="border-t pt-4">
        <Link to="/plan" className="text-sm text-link">{t("goPlan")}</Link>
      </div>
    </CardContent></Card>
  )
}

function LiveRunItem({ run }: { run: LiveRun }) {
  return (
    <li className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/runs/${run.id}`} className="min-w-0 font-mono font-medium wrap-anywhere text-link">{run.sid || run.id}</Link>
        <Badge className="shrink-0" variant={statusVariant(run.status)}>{run.status}</Badge>
      </div>
      <p className="text-xs text-muted-foreground wrap-anywhere">
        {run.env || "—"} · {run.mode} · {fmtWhen(run.created_at)}
        {run.source?.actor ? ` · ${run.source.actor}` : ""}
        {run.source?.repo ? ` · ${run.source.repo}` : ""}
      </p>
      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">{t("currentCase")}</p>
        <p className="font-mono text-xs wrap-anywhere">{run.current.case_id || "—"}</p>
        {run.current.step ? <p className="text-xs text-muted-foreground wrap-anywhere">{run.current.step}</p> : null}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
        <span>{t("passed")} <strong>{run.passed}</strong></span>
        <span className={run.failed ? "text-destructive" : ""}>{t("failed")} <strong>{run.failed}</strong></span>
        <span className="text-muted-foreground">{t("skipped")} <strong>{run.skipped}</strong></span>
      </div>
    </li>
  )
}

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { packLabel, sourceDetail, sourceHref, sourceLabel, type CaseSummary, type Run } from "@/lib/api"
import { fmtDur, fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { statusVariant } from "@/lib/status"
import { Link } from "react-router-dom"

export function renderRunStats({ summaries, run }: { summaries: CaseSummary[]; run: Run }) {
  return <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
    <Stat label={t("cases")} value={String(summaries.length || run.cases.length)} />
    <Stat label={t("passed")} value={String(run.passed)} />
    <Stat label={t("failed")} value={String(run.failed)} />
    <Stat label={t("skipped")} value={String(run.skipped)} />
    <Stat label={t("interrupted")} value={String(run.interrupted)} />
    <Stat label={t("elapsed")} value={fmtDur(run.elapsed_s)} />
  </div>
}

export function renderResource({ audit, run }: { audit: Record<string, unknown>; run: Run }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("resource")}</CardTitle>
    {renderCleanupStats({ audit })}
    <p className="text-sm text-muted-foreground">{String(audit.cleanup_status || "—")}</p>
    {run.files?.length ? (
      <>
        <h3 className="text-sm font-medium">{t("artifacts")}</h3>
        <ul className="space-y-1 text-sm">
          {run.files.map((file) => (
            <li key={file.path}>
              <a className="hover:underline" href={`/api/runs/${run.id}/file?path=${encodeURIComponent(file.path)}`}>
                {file.path}
              </a>
              <span className="text-xs text-muted-foreground"> · {file.size}</span>
            </li>
          ))}
        </ul>
      </>
    ) : null}
  </CardContent></Card>
}

export function renderCleanupStats({ audit }: { audit: Record<string, unknown> }) {
  return <div className="grid grid-cols-3 gap-2 text-sm">
    <div>
      <div className="text-xs text-muted-foreground">{t("registered")}</div>
      <div className="text-lg font-medium">{String(audit.registered ?? 0)}</div>
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{t("cleanupOk")}</div>
      <div className="text-lg font-medium">{String(audit.cleanup_completed ?? audit.completed ?? 0)}</div>
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{t("cleanupFail")}</div>
      <div className="text-lg font-medium">{String(audit.cleanup_failed ?? audit.failed ?? 0)}</div>
    </div>
  </div>
}

export function renderRunHeader({ run }: { run: Run }) {
  return <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-lg font-medium">{run.sid || run.id}</h1>
        <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {fmtWhen(run.created_at)} · {run.mode} · {run.env || "—"} · {t("runner")} {run.runner || "—"}
        {run.queries?.length ? ` · ${t("selector")} ${run.queries.join(" ")}` : ""}
        {packLabel(run.packs) ? ` · ${t("pack")} ${packLabel(run.packs)}` : ""}
      </p>
    </div>
    {run.has_report ? (
      <Button variant="outline" nativeButton={false} render={<Link to={`/runs/${run.id}/report`} />}>
        {t("report")}
      </Button>
    ) : null}
  </div>
}

export function renderSource({ run }: { run: Run }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-2">
    <CardTitle>{t("source")}</CardTitle>
    {run.source?.actor ? (
      <p>
        {t("actor")} {run.source.actor}
      </p>
    ) : null}
    {sourceHref(run.source) ? (
      <p>
        <a className="underline-offset-2 hover:underline" href={sourceHref(run.source)} target="_blank" rel="noreferrer">
          {sourceLabel(run.source, run.runner)}
        </a>
      </p>
    ) : (
      <p>{sourceLabel(run.source, run.runner)}</p>
    )}
    {sourceDetail(run.source, run.runner) ? (
      <p className="text-sm text-muted-foreground">{sourceDetail(run.source, run.runner)}</p>
    ) : null}
    {run.source?.note ? (
      <p className="text-sm text-muted-foreground">
        {t("note")} {run.source.note}
      </p>
    ) : null}
    {run.queries?.length ? (
      <p className="font-mono text-sm">
        {t("selector")} {run.queries.join(" ")}
      </p>
    ) : null}
  </CardContent></Card>
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 ">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </CardContent></Card>
  )
}

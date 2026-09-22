import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import type { Overview } from "@/lib/api"
import { t } from "@/lib/i18n"
import { Activity, CircleAlert, CircleCheck } from "lucide-react"

const PERCENT_SCALE = 100
const COVERAGE_PRECISION = 10

function healthState(overview: Overview) {
  if (overview.cleanup_failures || overview.consecutive_failure_cases) {
    return { title: t("healthFail"), style: "border-destructive/30 bg-destructive/5", Icon: CircleAlert }
  }
  if (overview.issues.some((issue) => issue.open)) {
    return { title: t("healthWarn"), style: "border-amber-400/40 bg-amber-50 dark:bg-amber-950/20", Icon: CircleAlert }
  }
  if (overview.live.length) {
    return { title: t("healthLive"), style: "border-sky-400/30 bg-sky-50 dark:bg-sky-950/20", Icon: Activity }
  }
  return { title: t("healthIdle"), style: "border-border bg-muted/30", Icon: CircleCheck }
}

function healthReason(overview: Overview) {
  const issue = overview.issues.find((item) => item.open)
  if (issue) return `${issue.cases.join("、")} · ${issue.message}`
  if (overview.cleanup_failures) return `${t("cleanup")}: ${overview.cleanup_failures}`
  if (overview.consecutive_failure_cases) return `${t("failed")}: ${overview.consecutive_failure_cases} ${t("cases")}`
  return t("emptyIssues")
}

function HealthStrip({ overview }: { overview: Overview }) {
  const { title, style, Icon } = healthState(overview)
  const reason = healthReason(overview)
  return (
    <Alert role="status" className={`flex items-start gap-3 rounded-xl px-4 py-3 ${style}`}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
        <AlertTitle className="shrink-0">{title}</AlertTitle>
        <AlertDescription className="min-w-0 truncate" title={reason}>{reason}</AlertDescription>
      </div>
    </Alert>
  )
}

function metrics(overview: Overview) {
  const { totals } = overview
  const openIssues = overview.issues.filter((issue) => issue.open).length
  const coverage = overview.coverage_total
    ? Math.round(PERCENT_SCALE * COVERAGE_PRECISION * overview.coverage.length / overview.coverage_total) / COVERAGE_PRECISION
    : 0
  return [
    { label: t("successRate"), value: totals.success_rate == null ? "—" : `${totals.success_rate}%`, hint: `${totals.passed} ${t("passed")} / ${totals.failed} ${t("failed")}` },
    { label: t("openIssues"), value: openIssues, hint: `${overview.consecutive_failure_cases} ${t("cases")} · ${t("failed")}`, alert: openIssues > 0 },
    { label: t("liveRuns"), value: overview.live.length, hint: overview.live.length ? t("healthLive") : t("emptyLive") },
    { label: t("coverage"), value: `${coverage}%`, hint: `${overview.coverage.length} / ${overview.coverage_total}` },
    { label: t("cleanup"), value: overview.cleanup_failures, hint: t("resource"), alert: overview.cleanup_failures > 0 },
    { label: t("rounds"), value: totals.passed + totals.failed + totals.skipped, hint: `${totals.skipped} ${t("skipped")}` },
  ]
}

export function OverviewSummary({ overview }: { overview: Overview }) {
  return (
    <div className="flex flex-col gap-6">
      <HealthStrip overview={overview} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metrics(overview).map((metric) => (
          <Card key={metric.label} className="min-w-0 gap-0 py-0"><CardContent className="p-4 flex min-w-0 flex-col gap-2 p-5">
            <div className="text-xs text-muted-foreground">{metric.label}</div>
            <div className={`text-2xl font-semibold tabular-nums ${metric.alert ? "text-destructive" : ""}`}>{metric.value}</div>
            <div className="text-xs text-muted-foreground">{metric.hint}</div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}

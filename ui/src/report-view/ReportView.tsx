import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { renderRoundsDetail } from "./case-details"
import { fmtDur } from "./host/fmt"
import { t } from "./host/i18n"
import { PassBar } from "./host/pass-bar"
import {
  errorGroups,
  successRate
} from "./logic"
import { renderArtifacts, renderIssues, renderReportHeader, renderResource, Stat } from "./report-panels"
import type { ErrorGroup, ReportCase, ReportCleanup, ReportPayload } from "./types"

export function ReportView({
  report,
  artifactHref,
}: {
  report: ReportPayload
  artifactHref?: (path: string) => string
}) {
  const cases = report.cases || []
  const cleanup = report.cleanup || {}
  const errors = errorGroups(cases)
  const rate = successRate(report)
  const passed = Number(report.passed || 0)
  const failed = Number(report.failed || 0)
  const skipped = Number(report.skipped || 0)
  const interrupted = Number(report.interrupted || 0)
  const status = report.status || "unknown"
  const statusLabel =
    { pass: t("passed"), fail: t("failed"), skip: t("skipped"), interrupted: t("interrupted") }[status] || status
  const cleanupLabel =
    { pass: t("passed"), fail: t("failed"), unknown: "—" }[cleanup.status || "unknown"] || cleanup.status || "—"
  const planned = report.duration || (report.mode === "soak" ? "—" : t("once"))
  const queries = (report.queries || []).join(" ")
  const top = errors[0]
  let conclusion = top
    ? `主要问题：${top.message}，共出现 ${top.count} 次。`
    : "所有已完成轮次均未发现失败。"
  if (cleanup.status === "fail") conclusion += ` 有 ${cleanup.failed || 0} 个清理阶段失败。`
  else if (cleanup.status === "pass") conclusion += " 已记录的资源清理均成功。"

  const openKeys = new Set(
    errors.map((row) => `${row.representative_case}:${row.representative_iteration}`),
  )

  function href(path: string): string {
    return artifactHref ? artifactHref(path) : encodeURI(path)
  }

  return (
    renderReportLayout({ status, statusLabel, report, queries, planned, rate, cleanupLabel, passed, failed, skipped, interrupted, conclusion, errors, cases, openKeys, href, cleanup })
  )
}

export function renderReportLayout({ status, statusLabel, report, queries, planned, rate, cleanupLabel, passed, failed, skipped, interrupted, conclusion, errors, cases, openKeys, href, cleanup }: { status: string; statusLabel: string; report: ReportPayload; queries: string; planned: string; rate: number | null; cleanupLabel: string; passed: number; failed: number; skipped: number; interrupted: number; conclusion: string; errors: ErrorGroup[]; cases: ReportCase[]; openKeys: Set<string>; href: (path: string) => string; cleanup: ReportCleanup }) {
  return <div className="space-y-6">
    {renderReportHeader({ status, statusLabel, report, queries })}

    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label={t("env")} value={String(report.env || "—")} />
      <Stat label={t("mode")} value={String(report.mode || "—")} />
      <Stat label={t("elapsed")} value={fmtDur(report.elapsed_s)} />
      <Stat label={t("duration")} value={String(planned)} />
      <Stat label={t("successRate")} value={rate == null ? "—" : `${rate.toFixed(1)}%`} />
      <Stat label={t("resource")} value={String(cleanupLabel)} />
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label={t("passed")} value={String(passed)} />
      <Stat label={t("failed")} value={String(failed)} />
      <Stat label={t("skipped")} value={String(skipped)} />
      <Stat label={t("interrupted")} value={String(interrupted)} />
    </div>

    <PassBar passed={passed} failed={failed} skipped={skipped + interrupted} />

    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-2">
      <CardTitle>{t("conclusion")}</CardTitle>
      <p className="text-sm">{conclusion}</p>
    </CardContent></Card>

    {renderIssues({ errors })}

    {renderRoundsDetail({ cases, openKeys, href })}

    {renderResource({ report, cleanup })}

    {renderArtifacts({ report, href })}
  </div>
}

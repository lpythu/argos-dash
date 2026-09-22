import { PageSkeleton } from "@/components/page-skeleton"
import { ErrorAlert } from "@/components/error-alert"
import { PassBar } from "@/components/pass-bar"
import { Card, CardContent } from "@/components/ui/card"
import { type Run } from "@/lib/api"
import { t } from "@/lib/i18n"
import { renderComments, renderEvents } from "./run-detail/activity"
import { renderCaseDetails, renderCurrentCase } from "./run-detail/case-panels"
import { renderResource, renderRunHeader, renderRunStats, renderSource } from "./run-detail/summary"
import { renderCaseOverview, renderIssues } from "./run-detail/tables"
import { useRunDetail } from "./run-detail/use-run-detail"

export function RunDetailPage() {
  const state = useRunDetail()
  if (state.loading) return <PageSkeleton />
  return <div className="space-y-6">
    {state.error ? <ErrorAlert>{state.error}</ErrorAlert> : null}
    {state.run ? renderRunDetail({ ...state, run: state.run }) : null}
  </div>
}

export function renderRunDetail({ run, summaries, selected, setCaseId, setMetric, audit, metricKeys, activeMetric, series, comments, body, setBody, onComment, events, eventTotal }: ReturnType<typeof useRunDetail> & { run: Run }) {
  return (
    <div className="space-y-6">
      {renderRunHeader({ run })}

      {renderRunStats({ summaries, run })}
      <PassBar passed={run.passed} failed={run.failed} skipped={run.skipped + run.interrupted} />

      {renderSource({ run })}

      {renderCaseOverview({ summaries, selected, setCaseId, setMetric })}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
          {renderCurrentCase({ summaries, selected, setCaseId, setMetric })}
          {selected ? (
            renderCaseDetails({ selected, series, activeMetric, setMetric, metricKeys })
          ) : (
            <p className="text-sm text-muted-foreground">{t("emptyCases")}</p>
          )}
        </CardContent></Card>

        {renderResource({ audit, run })}
      </div>

      {run.issues?.length ? (
        renderIssues({ issues: run.issues })
      ) : null}

      {renderEvents({ events, eventTotal })}

      {renderComments({ comments, onComment, body, setBody })}
    </div>
  )
}

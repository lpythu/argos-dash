import { PassBar } from "@/components/pass-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { sourceLabel, type OverviewIssue, type Run } from "@/lib/api"
import { fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { statusVariant } from "@/lib/status"
import { Link } from "react-router-dom"

const REPEATED_FAILURE_COUNT = 2

export function IssuesPanel({ issues }: { issues: readonly OverviewIssue[] }) {
  return (
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-medium">{t("issues")}</h2>
        <Badge variant={issues.length ? "fail" : "secondary"}>{issues.length}</Badge>
      </div>
      {issues.length ? (
        <div className="overflow-x-auto">
          <Table className="w-full min-w-xl table-fixed text-left text-sm">
            <TableCaption className="sr-only">{t("issues")}</TableCaption>
            <colgroup><col className="w-2/5" /><col className="w-1/4" /><col className="w-20" /><col /></colgroup>
            <TableHeader className="border-b text-xs text-muted-foreground">
              <TableRow>
                <TableHead scope="col" className="pb-3 pr-6 font-medium">{t("issues")}</TableHead>
                <TableHead scope="col" className="pb-3 pr-6 font-medium">{t("cases")}</TableHead>
                <TableHead scope="col" className="pb-3 pr-6 font-medium">n</TableHead>
                <TableHead scope="col" className="pb-3 font-medium">{t("lastRun")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">{issues.map((issue) => <IssueRow key={issue.fingerprint} issue={issue} />)}</TableBody>
          </Table>
        </div>
      ) : <p className="py-2 text-sm text-muted-foreground">{t("emptyIssues")}</p>}
    </CardContent></Card>
  )
}

function IssueRow({ issue }: { issue: OverviewIssue }) {
  return (
    <TableRow className="align-top">
      <TableCell className="whitespace-normal py-3 pr-6"><p className="whitespace-pre-wrap wrap-anywhere">{issue.message}</p></TableCell>
      <TableCell className="whitespace-normal py-3 pr-6">
        <code className="text-xs wrap-anywhere">{issue.cases.join("、")}</code>
        <div className="mt-1 text-xs text-muted-foreground wrap-anywhere">{issue.envs.join("、")}</div>
      </TableCell>
      <TableCell className="whitespace-normal py-3 pr-6 tabular-nums">
        {issue.count}
        {issue.max_streak >= REPEATED_FAILURE_COUNT ? <div className="text-xs text-destructive">×{issue.max_streak}</div> : null}
      </TableCell>
      <TableCell className="whitespace-normal py-3">
        <Link to={`/runs/${issue.latest_run}`} className="font-mono text-xs wrap-anywhere text-link">{issue.latest_slug}</Link>
        <div className="mt-1 text-xs text-muted-foreground">{fmtWhen(issue.last)}</div>
      </TableCell>
    </TableRow>
  )
}

export function RecentRunsPanel({ runs }: { runs: readonly Run[] }) {
  return (
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{t("recentRuns")}</h2>
        <Link to="/runs" className="text-sm text-link">{t("viewAll")}</Link>
      </div>
      {runs.length ? (
        <div className="overflow-x-auto">
          <Table className="w-full min-w-2xl text-left text-sm">
            <TableCaption className="sr-only">{t("recentRuns")}</TableCaption>
            <TableHeader className="border-b text-xs text-muted-foreground">
              <TableRow>
                {[t("runs"), t("status"), t("env"), t("source"), `${t("passed")} / ${t("failed")} / ${t("skipped")}`].map((label) => (
                  <TableHead key={label} scope="col" className="pb-3 pr-6 font-medium last:pr-0">{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">{runs.map((run) => <RecentRunRow key={run.id} run={run} />)}</TableBody>
          </Table>
        </div>
      ) : <p className="py-2 text-sm text-muted-foreground">{t("emptyRuns")}</p>}
    </CardContent></Card>
  )
}

function RecentRunRow({ run }: { run: Run }) {
  return (
    <TableRow className="align-top">
      <TableCell className="whitespace-normal py-3 pr-6">
        <Link to={`/runs/${run.id}`} className="font-mono text-xs text-link">{run.sid || run.id}</Link>
        <div className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{fmtWhen(run.created_at)}</div>
      </TableCell>
      <TableCell className="whitespace-normal py-3 pr-6 whitespace-nowrap"><Badge variant={statusVariant(run.status)}>{run.status}</Badge></TableCell>
      <TableCell className="whitespace-normal py-3 pr-6">
        <span className="wrap-anywhere">{run.env || "—"}</span>
        <div className="mt-1 text-xs text-muted-foreground">{run.mode}</div>
      </TableCell>
      <TableCell className="whitespace-normal py-3 pr-6">
        <div className="max-w-64 text-xs wrap-anywhere">{sourceLabel(run.source, run.runner)}</div>
        {run.source?.actor ? <div className="mt-1 text-xs text-muted-foreground wrap-anywhere">{run.source.actor}</div> : null}
      </TableCell>
      <TableCell className="whitespace-normal w-32 py-3">
        <div className="mb-2 whitespace-nowrap text-xs tabular-nums">{run.passed} / {run.failed} / {run.skipped}</div>
        <PassBar passed={run.passed} failed={run.failed} skipped={run.skipped} />
      </TableCell>
    </TableRow>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { t } from "./host/i18n"
import { statusVariant } from "./host/status"
import {
  caseAnchor,
  displayTime,
  formatSize
} from "./logic"
import type { ErrorGroup, ReportCleanup, ReportPayload } from "./types"

export function renderReportHeader({ status, statusLabel, report, queries }: { status: string; statusLabel: string; report: ReportPayload; queries: string }) {
  return <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-medium">{t("reportTitle")}</h1>
        <Badge variant={statusVariant(status)}>{statusLabel}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {displayTime(report.started)} · {report.mode || "—"} · {report.env || "—"}
        {queries ? ` · ${queries}` : ""}
      </p>
    </div>
  </div>
}

export function renderResource({ report, cleanup }: { report: ReportPayload; cleanup: ReportCleanup }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("resource")}</CardTitle>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div>
        <div className="text-xs text-muted-foreground">{t("registered")}</div>
        <div className="text-lg font-medium">{String(report.resource_audit?.registered ?? 0)}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{t("cleanupOk")}</div>
        <div className="text-lg font-medium">{String(cleanup.completed ?? 0)}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{t("cleanupFail")}</div>
        <div className="text-lg font-medium">{String(cleanup.failed ?? 0)}</div>
      </div>
    </div>
  </CardContent></Card>
}

export function renderIssues({ errors }: { errors: ErrorGroup[] }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("issues")}</CardTitle>
    {errors.length ? (
      <Table className="w-full text-left text-sm">
        <TableHeader className="text-muted-foreground">
          <TableRow>
            <TableHead className="py-1 font-medium">{t("errorFingerprint")}</TableHead>
            <TableHead className="py-1 font-medium">{t("cases")}</TableHead>
            <TableHead className="py-1 font-medium">#</TableHead>
            <TableHead className="py-1 font-medium">{t("rounds")}</TableHead>
            <TableHead className="py-1 font-medium" />
          </TableRow>
        </TableHeader>
        {renderIssueRows({ errors })}
      </Table>
    ) : (
      <p className="text-sm text-muted-foreground">{t("emptyIssues")}</p>
    )}
  </CardContent></Card>
}

export function renderIssueRows({ errors }: { errors: ErrorGroup[] }) {
  return <TableBody>
    {errors.map((row) => (
      <TableRow key={row.message} className="border-t align-top">
        <TableCell className="whitespace-normal py-2 text-destructive">{row.message}</TableCell>
        <TableCell className="whitespace-normal py-2">
          {row.cases.map((id) => (
            <code key={id} className="mr-2">
              {id}
            </code>
          ))}
        </TableCell>
        <TableCell className="whitespace-normal py-2 tabular-nums">{row.count}</TableCell>
        <TableCell className="whitespace-normal py-2">{row.iterations.join(", ")}</TableCell>
        <TableCell className="whitespace-normal py-2">
          <a
            className="text-sm text-link"
            href={`#${caseAnchor(row.representative_case, row.representative_iteration)}`}
          >
            {t("view")}
          </a>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
}

export function renderArtifacts({ report, href }: { report: ReportPayload; href: (path: string) => string }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("artifacts")}</CardTitle>
    {(report.artifacts || []).length ? (
      <Table className="w-full text-left text-sm">
        <TableHeader className="text-muted-foreground">
          <TableRow>
            <TableHead className="py-1 font-medium">{t("file")}</TableHead>
            <TableHead className="py-1 font-medium">{t("size")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(report.artifacts || []).map((row) => (
            <TableRow key={row.path} className="border-t">
              <TableCell className="whitespace-normal py-2">
                <a className="text-link" href={href(row.path)} target="_blank" rel="noreferrer">
                  {row.path}
                </a>
              </TableCell>
              <TableCell className="whitespace-normal py-2 tabular-nums text-muted-foreground">{formatSize(row.bytes)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <p className="text-sm text-muted-foreground">{t("noArtifacts")}</p>
    )}
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

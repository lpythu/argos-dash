import { Button } from "@/components/ui/button"
import { IterStrip } from "@/components/iter-strip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type CaseSummary, type Run } from "@/lib/api"
import { fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { statusVariant } from "@/lib/status"
import { type Dispatch, type SetStateAction } from "react"

export function renderCaseOverview({ summaries, selected, setCaseId, setMetric }: { summaries: CaseSummary[]; selected: CaseSummary; setCaseId: Dispatch<SetStateAction<string>>; setMetric: Dispatch<SetStateAction<string>> }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("caseOverview")}</CardTitle>
    <Table className="w-full text-left text-sm">
      <TableHeader className="text-muted-foreground">
        <TableRow>
          <TableHead className="py-1 font-medium">{t("cases")}</TableHead>
          <TableHead className="py-1 font-medium">{t("lastStatus")}</TableHead>
          <TableHead className="py-1 font-medium">P/F</TableHead>
          <TableHead className="py-1 font-medium">{t("elapsed")}</TableHead>
          <TableHead className="py-1 font-medium">{t("rounds")}</TableHead>
        </TableRow>
      </TableHeader>
      {renderCaseRows({ summaries, selected, setCaseId, setMetric })}
    </Table>
  </CardContent></Card>
}

export function renderIssues({ issues }: { issues: NonNullable<Run["issues"]> }): import("react").ReactNode {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("issues")}</CardTitle>
    <Table className="w-full text-left text-sm">
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.fingerprint} className="border-t align-top">
            <TableCell className="whitespace-normal py-2 text-destructive">{issue.message}</TableCell>
            <TableCell className="whitespace-normal">
              {issue.cases.map((item) => (
                <code key={item} className="mr-2">
                  {item}
                </code>
              ))}
            </TableCell>
            <TableCell className="whitespace-normal">{issue.count}</TableCell>
            <TableCell className="whitespace-normal">{issue.iterations.join(", ")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent></Card>
}

export function renderCaseRows({ summaries, selected, setCaseId, setMetric }: { summaries: CaseSummary[]; selected: CaseSummary; setCaseId: Dispatch<SetStateAction<string>>; setMetric: Dispatch<SetStateAction<string>> }) {
  return <TableBody>
    {summaries.map((item) => (
      <TableRow
        key={item.id}
        className={`cursor-pointer border-t ${item.id === selected?.id ? "bg-muted/40" : ""}`}
        onClick={() => {
          setCaseId(item.id)
          setMetric("")
        } }
      >
        <TableCell className="whitespace-normal py-2">
          <Button variant="link" className="h-auto p-0 font-mono text-xs" onClick={(event) => {
            event.stopPropagation()
            setCaseId(item.id)
            setMetric("")
          }}>{item.id}</Button>
          <div className="text-xs text-muted-foreground">{item.title}</div>
        </TableCell>
        <TableCell className="whitespace-normal">
          <Badge variant={statusVariant(item.latest_status)}>{item.latest_status}</Badge>
        </TableCell>
        <TableCell className="whitespace-normal">
          {item.passed} / {item.failed}
          {item.success_rate != null ? ` · ${item.success_rate}%` : ""}
        </TableCell>
        <TableCell className="whitespace-normal">{fmtDur(item.elapsed_s)}</TableCell>
        <TableCell className="whitespace-normal">
          <IterStrip items={item.iterations} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
}

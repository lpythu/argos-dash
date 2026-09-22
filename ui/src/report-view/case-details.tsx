import { Disclosure } from "@/components/disclosure"
import { ErrorAlert } from "@/components/error-alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmtDur, metricValue } from "./host/fmt"
import { t } from "./host/i18n"
import { statusVariant } from "./host/status"
import {
  caseAnchor,
  operationPassed,
  pretty,
  stepLabel
} from "./logic"
import type { ReportCase, ReportOperation } from "./types"

export function renderRoundsDetail({ cases, openKeys, href }: { cases: ReportCase[]; openKeys: Set<string>; href: (path: string) => string }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("roundsDetail")}</CardTitle>
    <div className="space-y-2">
      {cases.map((item) => (
        <CaseBlock
          key={`${item.id}-${item.iteration}`}
          item={item}
          open={openKeys.has(`${item.id || ""}:${item.iteration || 1}`) || item.status === "interrupted"}
          href={href} />
      ))}
    </div>
  </CardContent></Card>
}

export function CaseBlock({
  item,
  open,
  href,
}: {
  item: ReportCase
  open: boolean
  href: (path: string) => string
}) {
  const iteration = Number(item.iteration || 1)
  const anchor = caseAnchor(String(item.id || ""), iteration)
  return (
    <Disclosure
      id={anchor}
      className="scroll-mt-3 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
      defaultOpen={open}
     triggerClassName="cursor-pointer px-4 py-3 text-sm" title={<>
        <Badge variant={statusVariant(String(item.status || ""))}>{item.status}</Badge>{" "}
        <span className="font-medium">{item.id}</span>
        <span className="text-muted-foreground">
          {" "}
          · {t("roundN", { n: iteration })} · {fmtDur(item.elapsed_s)}
        </span>
       </>}>
      {renderCaseBody({ item, href })}
    </Disclosure>
  )
}

export function renderCaseBody({ item, href }: { item: ReportCase; href: (path: string) => string }) {
  return <div className="space-y-3 border-t px-4 py-3 text-sm">
    {item.error ? <ErrorAlert>{item.error}</ErrorAlert> : null}
    {Object.keys(item.metrics || {}).length ? (
      <div className="flex flex-wrap gap-2">
        {Object.entries(item.metrics || {}).map(([key, value]) => (
          <Badge key={key} variant="secondary">
            {key}={metricValue(value, item.metric_meta?.[key]?.unit)}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground">{t("noMetrics")}</p>
    )}
    {(item.steps || []).length ? (
      renderStepTable({ item, href })
    ) : null}
    {(item.notes || []).length ? (
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        {(item.notes || []).map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    ) : null}
  </div>
}

export function renderStepTable({ item, href }: { item: ReportCase; href: (path: string) => string }): import("react").ReactNode {
  return <Table className="w-full text-left text-sm">
    <TableHeader className="text-muted-foreground">
      <TableRow>
        <TableHead className="py-1 font-medium">{t("stage")}</TableHead>
        <TableHead className="py-1 font-medium">{t("status")}</TableHead>
        <TableHead className="py-1 font-medium">{t("elapsed")}</TableHead>
        <TableHead className="py-1 font-medium">{t("note")}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {(item.steps || []).map((step) => (
        <TableRow key={step.name} className="border-t align-top">
          <TableCell className="whitespace-normal py-2">{step.name}</TableCell>
          <TableCell className="whitespace-normal py-2">
            <Badge variant={statusVariant(String(step.status || ""))}>
              {stepLabel(step.status, item.status)}
            </Badge>
          </TableCell>
          <TableCell className="whitespace-normal py-2 tabular-nums">{step.elapsed_s != null ? fmtDur(step.elapsed_s) : "—"}</TableCell>
          <TableCell className="whitespace-normal py-2">
            {step.detail || ""}
            {(step.status === "failed" || step.status === "running") &&
              (item.status === "fail" || item.status === "interrupted")
              ? (step.operations || []).map((operation, index) => (
                <OperationBlock key={`${step.name}-${index}`} operation={operation} href={href} />
              ))
              : null}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
}

export function OperationBlock({
  operation,
  href,
}: {
  operation: ReportOperation
  href: (path: string) => string
}) {
  const passed = operationPassed(operation)
  return (
    <Disclosure className="mt-2 rounded-md border border-border bg-background p-2" defaultOpen={!passed} triggerClassName="cursor-pointer text-xs font-medium" title={<>
        <Badge variant={passed ? "pass" : "fail"}>{passed ? t("passed") : t("failed")}</Badge>{" "}
        {operation.label || operation.type || "op"}
       </>}>
      <pre className="mt-2 max-h-64 overflow-auto text-xs text-muted-foreground whitespace-pre-wrap">
        {t("expected")}: {pretty(operation.expected)}
        {"\n"}
        {t("actual")}: {pretty(operation.actual)}
      </pre>
      {(operation.artifacts || []).length ? (
        <div className="mt-2 space-x-2 text-xs">
          {(operation.artifacts || []).map((path) => (
            <a key={path} className="hover:underline" href={href(path)} target="_blank" rel="noreferrer">
              {path.split("/").pop()}
            </a>
          ))}
        </div>
      ) : null}
    </Disclosure>
  )
}

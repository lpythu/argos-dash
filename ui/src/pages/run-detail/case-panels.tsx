import { Disclosure } from "@/components/disclosure"
import { ErrorAlert } from "@/components/error-alert"
import { IterStrip } from "@/components/iter-strip"
import { SelectField } from "@/components/select-field"
import { Spark } from "@/components/spark"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { type CaseSummary, type Operation } from "@/lib/api"
import { fmtDur, metricValue } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { statusVariant } from "@/lib/status"
import { type Dispatch, type SetStateAction } from "react"

export function renderCaseDetails({ selected, series, activeMetric, setMetric, metricKeys }: { selected: CaseSummary; series: { iter: number; value: number }[]; activeMetric: string; setMetric: Dispatch<SetStateAction<string>>; metricKeys: string[] }): import("react").ReactNode {
  return <>
    <div className="flex items-center gap-2 text-sm">
      <Badge variant={statusVariant(selected.latest_status)}>{selected.latest_status}</Badge>
      <span>
        {selected.total} · {fmtDur(selected.elapsed_s)}
      </span>
    </div>
    <IterStrip items={selected.iterations} />
    {selected.latest_error ? <ErrorAlert>{selected.latest_error}</ErrorAlert> : null}
    {selected.steps?.length ? (
      renderSteps({ selected })
    ) : null}
    <h3 className="text-sm font-medium">{t("metrics")}</h3>
    {Object.keys(selected.metrics || {}).length ? (
      renderLatestMetrics({ selected })
    ) : (
      <p className="text-sm text-muted-foreground">{t("noMetrics")}</p>
    )}
    {Object.keys(selected.distributions || {}).length ? (
      renderDistributions({ selected })
    ) : null}
    {(selected.thresholds || []).map((item) => (
      <div key={item.name} className="flex items-center gap-2 text-sm">
        <Badge variant={item.passed ? "pass" : "fail"}>{item.passed ? t("passed") : t("failed")}</Badge>
        {item.name}: {metricValue(item.actual, item.unit)} {item.operator} {metricValue(item.target, item.unit)}
      </div>
    ))}
    {series.length > 1 ? (
      renderMetricSeries({ activeMetric, setMetric, metricKeys, series })
    ) : null}
  </>
}

export function renderMetricSeries({ activeMetric, setMetric, metricKeys, series }: { activeMetric: string; setMetric: Dispatch<SetStateAction<string>>; metricKeys: string[]; series: { iter: number; value: number }[] }) {
  return <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-sm">{t("metricSeries")}</span>
      <SelectField label={t("metricSeries")} value={activeMetric} onValueChange={setMetric}
        items={metricKeys.map((value) => ({ value, label: value }))} />
    </div>
    <Spark points={series} />
  </div>
}

export function renderLatestMetrics({ selected }: { selected: CaseSummary }) {
  return <div className="grid grid-cols-2 gap-2">
    {Object.entries(selected.metrics).map(([key, value]) => (
      <div key={key} className="rounded-lg bg-muted/50 p-2">
        <div className="text-xs text-muted-foreground">{key}</div>
        <div className="font-medium">{metricValue(value, selected.metric_meta?.[key]?.unit)}</div>
      </div>
    ))}
  </div>
}

export function renderCurrentCase({ summaries, selected, setCaseId, setMetric }: { summaries: CaseSummary[]; selected: CaseSummary; setCaseId: Dispatch<SetStateAction<string>>; setMetric: Dispatch<SetStateAction<string>> }) {
  return <div className="flex items-center justify-between gap-2">
    <CardTitle>{t("currentCase")}</CardTitle>
    {summaries.length ? (
      <SelectField label={t("currentCase")} value={selected?.id || ""}
        onValueChange={(value) => { setCaseId(value); setMetric("") } }
        items={summaries.map((item) => ({ value: item.id, label: item.id }))} />
    ) : null}
  </div>
}

export function renderDistributions({ selected }: { selected: CaseSummary }) {
  return <div className="grid grid-cols-2 gap-2">
    {Object.entries(selected.distributions).map(([key, value]) => (
      <div key={key} className="rounded-lg bg-muted/50 p-2">
        <div className="text-xs text-muted-foreground">{key} · P95</div>
        <div className="font-medium">{metricValue(value.p95, value.unit)}</div>
        <div className="text-xs text-muted-foreground">
          avg {metricValue(value.avg, value.unit)} · max {metricValue(value.max, value.unit)}
        </div>
      </div>
    ))}
  </div>
}

export function renderSteps({ selected }: { selected: CaseSummary }) {
  return <div className="space-y-2">
    <h3 className="text-sm font-medium">{t("steps")}</h3>
    <ul className="space-y-2 text-sm">
      {selected.steps.map((step) => (
        <li key={step.name} className="rounded-lg bg-muted/40 p-2">
          <div>
            <Badge variant={statusVariant(step.status)}>{step.status}</Badge> {step.name}
            {step.elapsed_s != null ? (
              <span className="text-muted-foreground"> · {fmtDur(step.elapsed_s)}</span>
            ) : null}
            {step.detail ? <span className="text-muted-foreground"> · {step.detail}</span> : null}
          </div>
          {(step.operations || []).map((operation, index) => (
            <OperationBlock key={`${step.name}-${index}`} operation={operation} />
          ))}
        </li>
      ))}
    </ul>
  </div>
}

export function pretty(value: unknown): string {
  if (value == null) return "—"
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function OperationBlock({ operation }: { operation: Operation }) {
  return (
    <Disclosure className="mt-2 rounded-md border border-border bg-background p-2" triggerClassName="cursor-pointer text-xs font-medium" title={<>
        {t("operations")} · {operation.label || operation.type || "op"}
       </>}>
      <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
        {t("expected")}: {pretty(operation.expected)}
        {"\n"}
        {t("actual")}: {pretty(operation.actual)}
      </pre>
    </Disclosure>
  )
}

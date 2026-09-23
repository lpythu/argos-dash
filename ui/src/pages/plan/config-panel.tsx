import { useState } from "react"
import { ErrorAlert } from "@/components/error-alert"
import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { copyText, fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { buildCommand } from "@/lib/plan"
import type { PlanHints } from "./hints"
import { planText } from "./messages"

type RunOptions = Omit<Parameters<typeof buildCommand>[0], "ids">
type ConfigProps = { ids: string[]; envs: readonly string[]; hints: PlanHints }
type FieldProps = { options: RunOptions; onChange: (next: RunOptions) => void; envs: readonly string[] }

export function ConfigPanel({ ids, envs, hints }: ConfigProps) {
  const [options, setOptions] = useState<RunOptions>({
    env: envs.includes("office") ? "office" : envs[0] || "office",
    soak: false, duration: "8h", pause: "2m", failFast: false,
  })
  const command = buildCommand({ ids, ...options })
  return <Card className="min-w-0 gap-0 py-0 md:col-span-2 xl:sticky xl:top-6 xl:col-span-1">
    <CardContent className="space-y-6 p-5">
      <CardTitle>{planText.config}</CardTitle>
      <RunFields options={options} onChange={setOptions} envs={envs} />
      <section className="space-y-3 border-t pt-5" aria-label={planText.summary}>
        <h2 className="text-sm font-medium">{planText.summary}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{t("selected")}</dt><dd>{ids.length}</dd></div>
          <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{t("estimated")}</dt>
            <dd>{ids.length ? fmtDur(hints.typical) : "—"}</dd></div>
        </dl>
      </section>
      <CommandPanel command={command} disabled={!ids.length} />
    </CardContent>
  </Card>
}

function RunFields({ options, onChange, envs }: FieldProps) {
  const environments = [...new Set(["office", "hk", ...envs])]
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <div className="space-y-2"><Label htmlFor="plan-env">{t("env")}</Label>
        <SelectField id="plan-env" className="w-full" label={t("env")} value={options.env}
          onValueChange={(env) => onChange({ ...options, env })}
          items={environments.map((value) => ({ value, label: value }))} /></div>
      <div className="space-y-2"><Label htmlFor="plan-mode">{t("mode")}</Label>
        <SelectField id="plan-mode" className="w-full" label={t("mode")} value={options.soak ? "soak" : "once"}
          onValueChange={(value) => onChange({ ...options, soak: value === "soak" })}
          items={[{ value: "once", label: planText.once }, { value: "soak", label: planText.soak }]} /></div>
    </div>
    {options.soak ? <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="plan-duration">{t("duration")}</Label>
        <Input id="plan-duration" value={options.duration} onChange={(event) => onChange({ ...options, duration: event.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="plan-pause">{t("pause")}</Label>
        <Input id="plan-pause" value={options.pause} onChange={(event) => onChange({ ...options, pause: event.target.value })} /></div>
    </div> : null}
    <Label className="leading-relaxed"><Checkbox checked={options.failFast}
      onCheckedChange={(failFast) => onChange({ ...options, failFast })} />{planText.failFast}</Label>
  </div>
}

function CommandPanel({ command, disabled }: { command: string; disabled: boolean }) {
  const [copiedCommand, setCopiedCommand] = useState("")
  const [error, setError] = useState("")
  async function copy() {
    setError("")
    try {
      await copyText(command)
      setCopiedCommand(command)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }
  return <section className="space-y-3 border-t pt-5" aria-label={planText.command}>
    <h2 className="text-sm font-medium">{planText.command}</h2>
    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-xs leading-relaxed wrap-anywhere">
      {disabled ? t("emptyPlan") : command}
    </pre>
    <Button className="w-full" disabled={disabled} onClick={() => void copy()}>
      {!disabled && copiedCommand === command ? t("copied") : t("copyCmd")}
    </Button>
    {error ? <ErrorAlert>{error}</ErrorAlert> : null}
    <p className="text-xs leading-relaxed text-muted-foreground">{t("planHint")}</p>
  </section>
}

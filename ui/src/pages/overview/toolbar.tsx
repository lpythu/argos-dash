import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import type { useOverview } from "./use-overview"

const HOURS = [
  { value: 24, label: t("hours24") },
  { value: 168, label: t("hours7d") },
  { value: 720, label: t("hours30d") },
]

export function OverviewToolbar({ state }: { state: ReturnType<typeof useOverview> }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-medium">{t("home")}</h1>
        <p className="text-sm text-muted-foreground">{fmtWhen(state.overview?.generated_at)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SelectField label={t("env")} value={state.env} onValueChange={state.setEnv}
          items={[{ value: "all", label: t("allEnvs") }, ...state.envs.map((value) => ({ value, label: value }))]} />
        <SelectField label={t("duration")} value={String(state.hours)} onValueChange={(value) => state.setHours(Number(value))}
          items={HOURS.map((item) => ({ value: String(item.value), label: item.label }))} />
        <Button variant="outline" onClick={() => void state.load()}>{t("refresh")}</Button>
      </div>
    </div>
  )
}

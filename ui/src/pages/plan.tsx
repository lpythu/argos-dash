import { PageSkeleton } from "@/components/page-skeleton"
import { ErrorAlert } from "@/components/error-alert"
import { useResource } from "@/hooks/use-resource"
import { loadCatalog } from "@/lib/load-catalog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Link } from "react-router-dom"

import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type Catalog, type CatalogCase } from "@/lib/api"
import { copyText, fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { buildCommand, clearPlan, togglePlan, usePlanIds } from "@/lib/plan"

function planHints(selected: CatalogCase[]) {
  const groups = new Map<string, string[]>()
  for (const item of selected) {
    const keys = [...new Set([item.mutex, ...(item.resources || [])].filter(Boolean))]
    for (const key of keys) {
      groups.set(key, [...(groups.get(key) || []), item.id])
    }
  }
  return {
    typical: selected.reduce((sum, item) => sum + (item.typical_s || 0), 0),
    conflicts: [...groups.entries()].filter(([, ids]) => new Set(ids).size > 1),
    after: selected.flatMap((item) =>
      (item.prefer_after || [])
        .filter((id) => selected.some((row) => row.id === id))
        .map((id) => `${id} → ${item.id}`),
    ),
  }
}

export function PlanPage() {
  const ids = usePlanIds()
  const { data: catalog, loading, error } = useResource(loadCatalog)
  const [env, setEnv] = useState("office")
  const [soak, setSoak] = useState(false)
  const [duration, setDuration] = useState("8h")
  const [pause, setPause] = useState("2m")
  const [failFast, setFailFast] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (catalog?.envs.length) setEnv((current) => catalog.envs.includes(current) ? current : catalog.envs[0])
  }, [catalog])

  const selected = (catalog?.items || []).filter((item) => ids.includes(item.id))
  const hints = useMemo(() => planHints(selected), [selected])
  const command = buildCommand({ ids, env, soak, duration, pause, failFast })

  async function copy() {
    await copyText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (loading) return <PageSkeleton layout="config" />
  if (error) return <ErrorAlert>{error}</ErrorAlert>
  if (!catalog) return null

  return (
    renderPlanPage({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied, command, selected, hints })
  )
}

function renderPlanPage({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied, command, selected, hints }: { soak: boolean; setSoak: Dispatch<SetStateAction<boolean>>; env: string; setEnv: Dispatch<SetStateAction<string>>; catalog: Catalog; duration: string; setDuration: Dispatch<SetStateAction<string>>; pause: string; setPause: Dispatch<SetStateAction<string>>; failFast: boolean; setFailFast: Dispatch<SetStateAction<boolean>>; ids: string[]; copy: () => Promise<void>; copied: boolean; command: string; selected: CatalogCase[]; hints: { typical: number; conflicts: [string, string[]][]; after: string[] } }) {
  return <div className="space-y-4">
    <div>
      <h1 className="text-lg font-medium">{t("plan")}</h1>
      <p className="text-sm text-muted-foreground">{t("planHint")}</p>
    </div>
    {renderPlanConfig({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied, command, selected, hints })}
    <div className="grid gap-4 md:grid-cols-2">
      {renderSelected({ selected })}
      <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
        <CardTitle>{t("cases")}</CardTitle>
        <ul className="max-h-96 space-y-2 overflow-auto">
          {catalog.items.map((item) => (
            <li key={item.id}>
              <Button type="button" variant="ghost" className="h-auto w-full flex-col items-start whitespace-normal text-left" onClick={() => togglePlan(item.id)}>
                <code>{item.id}</code>
                <div className="text-xs text-muted-foreground">
                  {item.pack} · {item.title}
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent></Card>
    </div>
  </div>
}

function renderSelected({ selected }: { selected: CatalogCase[] }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <CardTitle>
        {t("selected")} {selected.length}
      </CardTitle>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clearPlan}>
          {t("clear")}
        </Button>
        <Link to="/cases" className="self-center text-sm text-muted-foreground hover:underline">
          {t("goCases")}
        </Link>
      </div>
    </div>
    {selected.length ? (
      renderSelectedCases({ selected })
    ) : (
      <p className="text-sm text-muted-foreground">{t("emptyPlan")}</p>
    )}
  </CardContent></Card>
}

function renderSelectedCases({ selected }: { selected: CatalogCase[] }): import("react").ReactNode {
  return <ul className="space-y-2">
    {selected.map((item) => (
      <li key={item.id} className="flex items-center justify-between gap-2">
        <div>
          <code>{item.id}</code>
          <div className="text-xs text-muted-foreground">
            {item.title}
            {item.mutex ? ` · ${item.mutex}` : ""}
            {item.typical_s ? ` · ${fmtDur(item.typical_s)}` : ""}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => togglePlan(item.id)}>
          {t("clear")}
        </Button>
      </li>
    ))}
  </ul>
}

function renderPlanConfig({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied, command, selected, hints }: { soak: boolean; setSoak: Dispatch<SetStateAction<boolean>>; env: string; setEnv: Dispatch<SetStateAction<string>>; catalog: Catalog; duration: string; setDuration: Dispatch<SetStateAction<string>>; pause: string; setPause: Dispatch<SetStateAction<string>>; failFast: boolean; setFailFast: Dispatch<SetStateAction<boolean>>; ids: string[]; copy: () => Promise<void>; copied: boolean; command: string; selected: CatalogCase[]; hints: { typical: number; conflicts: [string, string[]][]; after: string[] } }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    {renderPlanControls({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied })}
    <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{ids.length ? command : t("emptyPlan")}</pre>
    {selected.length ? (
      <div className="flex flex-col items-start gap-2 text-sm">
        <div>
          {t("estimated")}: {fmtDur(hints.typical)}
        </div>
        {hints.conflicts.map(([key, items]) => (
          <div key={key} className="text-destructive">
            {t("conflict")}: {key} · {items.join(", ")}
          </div>
        ))}
        {hints.after.length ? (
          <div className="text-muted-foreground">
            {t("preferAfter")}: {hints.after.join(" · ")}
          </div>
        ) : null}
      </div>
    ) : null}
  </CardContent></Card>
}

function renderPlanControls({ soak, setSoak, env, setEnv, catalog, duration, setDuration, pause, setPause, failFast, setFailFast, ids, copy, copied }: { soak: boolean; setSoak: Dispatch<SetStateAction<boolean>>; env: string; setEnv: Dispatch<SetStateAction<string>>; catalog: Catalog; duration: string; setDuration: Dispatch<SetStateAction<string>>; pause: string; setPause: Dispatch<SetStateAction<string>>; failFast: boolean; setFailFast: Dispatch<SetStateAction<boolean>>; ids: string[]; copy: () => Promise<void>; copied: boolean }) {
  return <div className="flex flex-wrap items-end gap-3">
    <Label className="flex-col items-start gap-2 text-sm">
      <div>{t("mode")}</div>
      <SelectField label={t("mode")} value={soak ? "soak" : "once"} onValueChange={(value) => setSoak(value === "soak")}
        items={[{ value: "once", label: t("once") }, { value: "soak", label: t("soak") }]} />
    </Label>
    <Label className="flex-col items-start gap-2 text-sm">
      <div>{t("env")}</div>
      <SelectField label={t("env")} value={env} onValueChange={setEnv}
        items={["office", "hk", ...catalog.envs.filter((item) => !["office", "hk"].includes(item))].map((value) => ({ value, label: value }))} />
    </Label>
    <Label className="flex-col items-start gap-2 text-sm">
      <div>{t("duration")}</div>
      <Input className="w-24" value={duration} disabled={!soak} onChange={(event) => setDuration(event.target.value)} />
    </Label>
    <Label className="flex-col items-start gap-2 text-sm">
      <div>{t("pause")}</div>
      <Input className="w-24" value={pause} disabled={!soak} onChange={(event) => setPause(event.target.value)} />
    </Label>
    <Label className="flex items-center gap-2 text-sm">
      <Checkbox checked={failFast} onCheckedChange={setFailFast} />
      {t("failFast")}
    </Label>
    <Button disabled={!ids.length} onClick={() => void copy()}>
      {copied ? t("copied") : t("copyCmd")}
    </Button>
  </div>
}

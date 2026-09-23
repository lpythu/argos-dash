import { Link } from "react-router-dom"
import { SelectField } from "@/components/select-field"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { t } from "@/lib/i18n"
import { listText } from "./shared"
import type { useListFilters } from "./use-filters"

type RunFilters = { q: string; env: string; status: string }
type CaseFilters = { q: string; pack: string; group: string }
type FilterState<T extends Record<string, string>> = ReturnType<typeof useListFilters<T>>
type RunProps = { state: FilterState<RunFilters>; envs: readonly string[] }
type CaseProps = { state: FilterState<CaseFilters>; facets: { packs: string[]; groups: string[] };
  selectedCount: number; disableAdd: boolean; addPage: () => void }
const FILTER_ROW = "flex w-full flex-wrap items-center gap-3"
const FILTER_SELECT = "w-full min-[480px]:w-[160px]"

export function RunsToolbar({ state, envs }: RunProps) {
  const { filters, change, reset, active } = state
  return <div className="space-y-4">
    <h1 className="text-lg font-medium">{t("runs")}</h1>
    <div className={FILTER_ROW}>
      <Input className="w-full sm:w-[320px] xl:w-[400px]" value={filters.q}
        onChange={(event) => change("q", event.target.value)} aria-label={listText.runSearch} placeholder={listText.runSearch} />
      <SelectField className={FILTER_SELECT} label={t("env")} value={filters.env} onValueChange={(value) => change("env", value)}
        items={[{ value: "all", label: t("allEnvs") }, ...envs.map((value) => ({ value, label: value }))]} />
      <SelectField className="w-full min-[480px]:w-[140px]" label={t("status")} value={filters.status} onValueChange={(value) => change("status", value)}
        items={[{ value: "all", label: listText.allStatuses }, ...["running", "pass", "fail", "skip"].map((value) => ({ value, label: value }))]} />
      <Button variant="ghost" disabled={!active} onClick={reset}>{listText.reset}</Button>
    </div>
  </div>
}

export function CasesToolbar({ state, facets, selectedCount, disableAdd, addPage }: CaseProps) {
  const { filters, change, reset, active } = state
  return <div className="space-y-4">
    <h1 className="text-lg font-medium">{t("cases")}</h1>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
        <Input className="w-full sm:w-[280px] xl:w-[360px]" value={filters.q}
          onChange={(event) => change("q", event.target.value)} aria-label={listText.caseSearch} placeholder={listText.caseSearch} />
        <SelectField className="w-full min-[480px]:w-[180px]" label={t("pack")} value={filters.pack} onValueChange={(value) => change("pack", value)}
          items={[{ value: "all", label: listText.allPacks }, ...facets.packs.map((value) => ({ value, label: value }))]} />
        <SelectField className={FILTER_SELECT} label={t("group")} value={filters.group} onValueChange={(value) => change("group", value)}
          items={[{ value: "all", label: listText.allGroups }, ...facets.groups.map((value) => ({ value, label: value }))]} />
        <Button variant="ghost" disabled={!active} onClick={reset}>{listText.reset}</Button>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        <Button disabled={disableAdd} variant="outline" onClick={addPage}>{listText.addPage}</Button>
        <Link className={buttonVariants({ variant: "ghost" })} to="/plan">{t("plan")} ({selectedCount})</Link>
      </div>
    </div>
  </div>
}

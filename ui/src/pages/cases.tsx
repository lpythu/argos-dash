import { TableSkeleton } from "@/components/page-skeleton"
import { ErrorAlert } from "@/components/error-alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Pager } from "@/components/pager"
import { SelectField } from "@/components/select-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePage, type UsePage } from "@/hooks/use-page"
import { api, type Catalog, type CatalogCase } from "@/lib/api"
import { fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { pageQS } from "@/lib/page"
import { addPlan, togglePlan, usePlanIds } from "@/lib/plan"
import { statusVariant } from "@/lib/status"

export function CasesPage() {
  const [q, setQ] = useState("")
  const [pack, setPack] = useState("all")
  const [group, setGroup] = useState("all")
  const [facets, setFacets] = useState<{ packs: string[]; groups: string[] }>({ packs: [], groups: [] })
  const selected = usePlanIds()
  const list = usePage<CatalogCase>(
    async (query) => {
      const extra: Record<string, string | undefined> = {}
      if (q.trim()) extra.q = q.trim()
      if (pack !== "all") extra.pack = pack
      if (group !== "all") extra.group = group
      const data = await api<Catalog>(`/api/catalog${pageQS(query, extra)}`)
      setFacets({ packs: data.packs, groups: data.groups })
      return data
    },
    [q, pack, group],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-lg font-medium">{t("cases")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-56" value={q} onChange={(event) => setQ(event.target.value)} aria-label={t("filter")} placeholder={t("filter")} />
          <SelectField label={t("pack")} value={pack} onValueChange={setPack}
            items={[{ value: "all", label: t("pack") }, ...facets.packs.map((value) => ({ value, label: value }))]} />
          <SelectField label={t("group")} value={group} onValueChange={setGroup}
            items={[{ value: "all", label: t("group") }, ...facets.groups.map((value) => ({ value, label: value }))]} />
          <Button disabled={list.loading || !!list.error} variant="outline" onClick={() => addPlan(list.items.map((item) => item.id))}>
            {t("addVisible")}
          </Button>
          <Link to="/plan" className="text-sm text-muted-foreground hover:underline">
            {t("plan")} ({selected.length})
          </Link>
        </div>
      </div>
      {list.error ? <ErrorAlert>{list.error}</ErrorAlert> : null}
      {list.loading ? <TableSkeleton /> : list.items.length ? renderCasesTable({ list, selected }) :
        !list.error ? <p className="text-sm text-muted-foreground">{t("emptyCases")}</p> : null}
      {!list.loading ? <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} /> : null}
    </div>
  )
}

function renderCasesTable({ list, selected }: { list: UsePage<CatalogCase>; selected: string[] }): import("react").ReactNode {
  return <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
    <Table className="w-full text-left text-sm">
      <TableHeader className="bg-muted/50 text-muted-foreground">
        <TableRow>
          <TableHead className="px-3 py-2 w-8" />
          <TableHead className="px-3 py-2">id</TableHead>
          <TableHead className="px-3 py-2">{t("pack")}</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("typical")}</TableHead>
          <TableHead className="px-3 py-2">{t("mutex")}</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("lastStatus")}</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("lastEnv")}</TableHead>
          <TableHead className="px-3 py-2">{t("lastRun")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.items.map((item) => (
          <CaseRow key={item.id} item={item} on={selected.includes(item.id)} />
        ))}
      </TableBody>
    </Table>
  </div>
}

function CaseRow({ item, on }: { item: CatalogCase; on: boolean }) {
  return (
    <TableRow className={`border-t ${on ? "bg-muted/40" : ""}`}>
      <TableCell className="whitespace-normal px-3 py-2">
        <Checkbox aria-label={`${t("selected")}: ${item.title || item.id}`} checked={on} onCheckedChange={() => togglePlan(item.id)} />
      </TableCell>
      <TableCell className="whitespace-normal px-3 py-2">
        <code>{item.id}</code>
        <div className="text-xs text-muted-foreground">{item.title}</div>
      </TableCell>
      <TableCell className="whitespace-normal px-3 py-2">
        {item.pack || "—"}
        {item.group ? <div className="text-xs text-muted-foreground">{item.group}</div> : null}
      </TableCell>
      <TableCell className="whitespace-nowrap px-3 py-2">{item.typical_s ? fmtDur(item.typical_s) : "—"}</TableCell>
      <TableCell className="whitespace-normal px-3 py-2">{item.mutex || (item.resources || []).join(", ") || "—"}</TableCell>
      <TableCell className="whitespace-normal px-3 py-2">
        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap px-3 py-2">{item.env || "—"}</TableCell>
      <TableCell className="whitespace-normal px-3 py-2">
        <Link to={`/runs/${item.run_id}`} className="font-mono hover:underline">
          {item.run_id}
        </Link>
      </TableCell>
    </TableRow>
  )
}

import { CasesToolbar } from "./lists/toolbars"
import { useListFilters } from "./lists/use-filters"
import { LIST_TABLE, ListColumns, ListEmpty, ListSkeleton } from "./lists/shared"
import { ErrorAlert } from "@/components/error-alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Pager } from "@/components/pager"
import { Badge } from "@/components/ui/badge"
import { usePage, type UsePage } from "@/hooks/use-page"
import { api, type Catalog, type CatalogCase } from "@/lib/api"
import { fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { pageQS } from "@/lib/page"
import { addPlan, togglePlan, usePlanIds } from "@/lib/plan"
import { statusVariant } from "@/lib/status"

export function CasesPage() {
  const state = useListFilters({ q: "", pack: "all", group: "all" })
  const { q, pack, group } = state.filters
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
    { page: state.page, setPage: state.setPage },
  )

  return (
    <div className="space-y-6">
      <CasesToolbar state={state} facets={facets} selectedCount={selected.length}
        disableAdd={list.loading || !!list.error || !list.items.length}
        addPage={() => addPlan(list.items.map((item) => item.id))} />
      {list.error ? <ErrorAlert>{list.error}</ErrorAlert> : null}
      {list.loading ? <ListSkeleton kind="cases" /> : list.items.length ? renderCasesTable({ list, selected }) :
        !list.error ? <ListEmpty active={state.active} reset={state.reset} message={t("emptyCases")} /> : null}
      {!list.loading ? <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} /> : null}
    </div>
  )
}

function renderCasesTable({ list, selected }: { list: UsePage<CatalogCase>; selected: string[] }): import("react").ReactNode {
  return <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
    <Table className={LIST_TABLE}>
      <ListColumns kind="cases" />
      <TableHeader className="bg-muted/50 text-muted-foreground">
        <TableRow>
          <TableHead className="px-3 py-3" />
          <TableHead className="px-3 py-3">id</TableHead>
          <TableHead className="px-3 py-3">{t("pack")}</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("typical")}</TableHead>
          <TableHead className="px-3 py-3">{t("mutex")}</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("lastStatus")}</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("lastEnv")}</TableHead>
          <TableHead className="px-3 py-3">{t("lastRun")}</TableHead>
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
    <TableRow className={`border-t align-top ${on ? "bg-muted/40" : ""}`}>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
        <Checkbox aria-label={`${t("selected")}: ${item.title || item.id}`} checked={on} onCheckedChange={() => togglePlan(item.id)} />
      </TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
        <code>{item.id}</code>
        <div className="text-xs text-muted-foreground">{item.title}</div>
      </TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
        {item.pack || "—"}
        {item.group ? <div className="text-xs text-muted-foreground">{item.group}</div> : null}
      </TableCell>
      <TableCell className="whitespace-nowrap px-3 py-3">{item.typical_s ? fmtDur(item.typical_s) : "—"}</TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">{item.mutex || (item.resources || []).join(", ") || "—"}</TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
      </TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">{item.env || "—"}</TableCell>
      <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
        <Link to={`/runs/${item.run_id}`} className="font-mono text-link">
          {item.run_id}
        </Link>
      </TableCell>
    </TableRow>
  )
}

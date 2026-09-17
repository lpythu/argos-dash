import { useState } from "react"
import { Link } from "react-router-dom"

import { Field } from "@/components/field"
import { Pager } from "@/components/pager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePage } from "@/hooks/use-page"
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
          <Input className="w-56" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t("filter")} />
          <Field value={pack} onChange={(event) => setPack(event.target.value)}>
            <option value="all">{t("pack")}</option>
            {facets.packs.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Field>
          <Field value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="all">{t("group")}</option>
            {facets.groups.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Field>
          <Button variant="outline" onClick={() => addPlan(list.items.map((item) => item.id))}>
            {t("addVisible")}
          </Button>
          <Link to="/plan" className="text-sm text-muted-foreground hover:underline">
            {t("plan")} ({selected.length})
          </Link>
        </div>
      </div>
      {list.items.length ? (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 w-8" />
                <th className="px-3 py-2">id</th>
                <th className="px-3 py-2">{t("pack")}</th>
                <th className="px-3 py-2">{t("typical")}</th>
                <th className="px-3 py-2">{t("mutex")}</th>
                <th className="px-3 py-2">{t("lastStatus")}</th>
                <th className="px-3 py-2">{t("lastEnv")}</th>
                <th className="px-3 py-2">{t("lastRun")}</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((item) => (
                <CaseRow key={item.id} item={item} on={selected.includes(item.id)} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{list.loading ? "…" : t("emptyCases")}</p>
      )}
      <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} />
    </div>
  )
}

function CaseRow({ item, on }: { item: CatalogCase; on: boolean }) {
  return (
    <tr className={`border-t ${on ? "bg-muted/40" : ""}`}>
      <td className="px-3 py-2">
        <input type="checkbox" checked={on} onChange={() => togglePlan(item.id)} />
      </td>
      <td className="px-3 py-2">
        <code>{item.id}</code>
        <div className="text-xs text-muted-foreground">{item.title}</div>
      </td>
      <td className="px-3 py-2">
        {item.pack || "—"}
        {item.group ? <div className="text-xs text-muted-foreground">{item.group}</div> : null}
      </td>
      <td className="px-3 py-2">{item.typical_s ? fmtDur(item.typical_s) : "—"}</td>
      <td className="px-3 py-2">{item.mutex || (item.resources || []).join(", ") || "—"}</td>
      <td className="px-3 py-2">
        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
      </td>
      <td className="px-3 py-2">{item.env || "—"}</td>
      <td className="px-3 py-2">
        <Link to={`/runs/${item.run_id}`} className="font-mono hover:underline">
          {item.run_id}
        </Link>
      </td>
    </tr>
  )
}

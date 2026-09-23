import { RunsToolbar } from "./lists/toolbars"
import { useListFilters } from "./lists/use-filters"
import { LIST_TABLE, ListColumns, ListEmpty, ListSkeleton } from "./lists/shared"
import { ErrorAlert } from "@/components/error-alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom"

import { Pager } from "@/components/pager"
import { PassBar } from "@/components/pass-bar"
import { Badge } from "@/components/ui/badge"
import { usePage, type UsePage } from "@/hooks/use-page"
import { api, packLabel, packTitle, sourceDetail, sourceHref, sourceLabel, type Run } from "@/lib/api"
import { fmtDur, fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { pageQS, type Page } from "@/lib/page"
import { statusVariant } from "@/lib/status"
import { useState } from "react"

function SourceCell({ run }: { run: Run }) {
  const href = sourceHref(run.source)
  const label = sourceLabel(run.source, run.runner)
  const detail = sourceDetail(run.source, run.runner)
  const inner = (
    <>
      <div>{label}</div>
      {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
    </>
  )
  if (!href) return <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">{inner}</TableCell>
  return (
    <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
      <a className="text-link" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    </TableCell>
  )
}

export function RunsPage() {
  const [envs, setEnvs] = useState<string[]>([])
  const state = useListFilters({ q: "", env: "all", status: "all" })
  const { q, env, status } = state.filters
  const list = usePage<Run>(
    async (query) => {
      const extra: Record<string, string | undefined> = {}
      if (env !== "all") extra.env = env
      if (status !== "all") extra.status = status
      if (q.trim()) extra.q = q.trim()
      const [data, meta] = await Promise.all([
        api<Page<Run>>(`/api/runs${pageQS(query, extra)}`),
        api<{ envs: string[] }>("/api/envs"),
      ])
      setEnvs(meta.envs)
      return data
    },
    [env, status, q],
    { page: state.page, setPage: state.setPage, intervalMs: 4000 },
  )

  return (
    <div className="space-y-6">
      <RunsToolbar state={state} envs={envs} />
      {list.error ? <ErrorAlert>{list.error}</ErrorAlert> : null}
      {list.loading ? <ListSkeleton kind="runs" /> : list.items.length ? renderRunRows({ list }) :
        !list.error ? <ListEmpty active={state.active} reset={state.reset} message={t("emptyRuns")} /> : null}
      {!list.loading ? <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} /> : null}
    </div>
  )
}

function renderRunRows({ list }: { list: UsePage<Run> }): import("react").ReactNode {
  return <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
    <Table className={LIST_TABLE}>
      <ListColumns kind="runs" />
      <TableHeader className="bg-muted/50 text-muted-foreground">
        <TableRow>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("status")}</TableHead>
          <TableHead className="px-3 py-3">id</TableHead>
          <TableHead className="px-3 py-3">{t("actor")}</TableHead>
          <TableHead className="px-3 py-3">{t("source")}</TableHead>
          <TableHead className="px-3 py-3">{t("selector")}</TableHead>
          <TableHead className="px-3 py-3">{t("pack")}</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("env")}</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">P/F/S</TableHead>
          <TableHead className="whitespace-nowrap px-3 py-3">{t("elapsed")}</TableHead>
        </TableRow>
      </TableHeader>
      {renderRunsTable({ list })}
    </Table>
  </div>
}

function renderRunsTable({ list }: { list: UsePage<Run> }) {
  return <TableBody>
    {list.items.map((run) => (
      <TableRow key={run.id} className="border-t align-top">
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
          <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
        </TableCell>
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
          <Link to={`/runs/${run.id}`} className="font-mono text-link">
            {run.sid || run.id}
          </Link>
          <div className="text-xs text-muted-foreground">{fmtWhen(run.created_at)}</div>
          <div className="mt-1 w-32">
            <PassBar passed={run.passed} failed={run.failed} skipped={run.skipped} />
          </div>
        </TableCell>
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">{run.source?.actor || "—"}</TableCell>
        <SourceCell run={run} />
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3 font-mono text-xs">{run.queries?.join(" ") || "—"}</TableCell>
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3" title={(run.packs || []).map(packTitle).join(", ")}>
          {packLabel(run.packs) || "—"}
        </TableCell>
        <TableCell className="whitespace-normal wrap-anywhere px-3 py-3">
          {run.env || "—"} · {run.mode}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-3 tabular-nums">
          {run.passed} / {run.failed} / {run.skipped}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-3">{fmtDur(run.elapsed_s)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
}

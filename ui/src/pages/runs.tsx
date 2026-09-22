import { TableSkeleton } from "@/components/page-skeleton"
import { ErrorAlert } from "@/components/error-alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom"

import { Pager } from "@/components/pager"
import { PassBar } from "@/components/pass-bar"
import { SelectField } from "@/components/select-field"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  if (!href) return <TableCell className="whitespace-normal px-3 py-2">{inner}</TableCell>
  return (
    <TableCell className="whitespace-normal px-3 py-2">
      <a className="underline-offset-2 hover:underline" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    </TableCell>
  )
}

export function RunsPage() {
  const [envs, setEnvs] = useState<string[]>([])
  const [env, setEnv] = useState("all")
  const [status, setStatus] = useState("all")
  const [q, setQ] = useState("")
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
    { intervalMs: 4000 },
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-lg font-medium">{t("runs")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-64" value={q} onChange={(event) => setQ(event.target.value)} aria-label={t("filter")} placeholder={t("filter")} />
          <SelectField label={t("env")} value={env} onValueChange={setEnv}
            items={[{ value: "all", label: t("allEnvs") }, ...envs.map((value) => ({ value, label: value }))]} />
          <SelectField label={t("status")} value={status} onValueChange={setStatus}
            items={[{ value: "all", label: t("status") }, ...["running", "pass", "fail", "skip"].map((value) => ({ value, label: value }))]} />
        </div>
      </div>
      {list.error ? <ErrorAlert>{list.error}</ErrorAlert> : null}
      {list.loading ? <TableSkeleton /> : list.items.length ? renderRunRows({ list }) :
        !list.error ? <p className="text-sm text-muted-foreground">{t("emptyRuns")}</p> : null}
      {!list.loading ? <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} /> : null}
    </div>
  )
}

function renderRunRows({ list }: { list: UsePage<Run> }): import("react").ReactNode {
  return <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
    <Table className="w-full text-left text-sm">
      <TableHeader className="bg-muted/50 text-muted-foreground">
        <TableRow>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("status")}</TableHead>
          <TableHead className="px-3 py-2">id</TableHead>
          <TableHead className="px-3 py-2">{t("actor")}</TableHead>
          <TableHead className="px-3 py-2">{t("source")}</TableHead>
          <TableHead className="px-3 py-2">{t("selector")}</TableHead>
          <TableHead className="px-3 py-2">{t("pack")}</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("env")}</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">P/F/S</TableHead>
          <TableHead className="w-px whitespace-nowrap px-3 py-2">{t("elapsed")}</TableHead>
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
        <TableCell className="whitespace-normal px-3 py-2">
          <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
        </TableCell>
        <TableCell className="whitespace-normal px-3 py-2">
          <Link to={`/runs/${run.id}`} className="font-mono underline-offset-2 hover:underline">
            {run.sid || run.id}
          </Link>
          <div className="text-xs text-muted-foreground">{fmtWhen(run.created_at)}</div>
          <div className="mt-1 w-32">
            <PassBar passed={run.passed} failed={run.failed} skipped={run.skipped} />
          </div>
        </TableCell>
        <TableCell className="whitespace-normal px-3 py-2">{run.source?.actor || "—"}</TableCell>
        <SourceCell run={run} />
        <TableCell className="whitespace-normal px-3 py-2 font-mono text-xs">{run.queries?.join(" ") || "—"}</TableCell>
        <TableCell className="whitespace-normal px-3 py-2" title={(run.packs || []).map(packTitle).join(", ")}>
          {packLabel(run.packs) || "—"}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-2">
          {run.env || "—"} · {run.mode}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums">
          {run.passed} / {run.failed} / {run.skipped}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-2">{fmtDur(run.elapsed_s)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
}

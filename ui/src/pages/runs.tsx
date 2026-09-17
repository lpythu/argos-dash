import { Link } from "react-router-dom"

import { Field } from "@/components/field"
import { Pager } from "@/components/pager"
import { PassBar } from "@/components/pass-bar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { usePage } from "@/hooks/use-page"
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
  if (!href) return <td className="px-3 py-2">{inner}</td>
  return (
    <td className="px-3 py-2">
      <a className="underline-offset-2 hover:underline" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    </td>
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
          <Input className="w-64" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t("filter")} />
          <Field value={env} onChange={(event) => setEnv(event.target.value)}>
            <option value="all">{t("allEnvs")}</option>
            {envs.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Field>
          <Field value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">{t("status")}</option>
            {["running", "pass", "fail", "skip"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Field>
        </div>
      </div>
      {list.items.length ? (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{t("status")}</th>
                <th className="px-3 py-2">id</th>
                <th className="px-3 py-2">{t("actor")}</th>
                <th className="px-3 py-2">{t("source")}</th>
                <th className="px-3 py-2">{t("selector")}</th>
                <th className="px-3 py-2">{t("pack")}</th>
                <th className="px-3 py-2">{t("env")}</th>
                <th className="px-3 py-2">P/F/S</th>
                <th className="px-3 py-2">{t("elapsed")}</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((run) => (
                <tr key={run.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Link to={`/runs/${run.id}`} className="font-mono underline-offset-2 hover:underline">
                      {run.sid || run.id}
                    </Link>
                    <div className="text-xs text-muted-foreground">{fmtWhen(run.created_at)}</div>
                    <div className="mt-1 w-32">
                      <PassBar passed={run.passed} failed={run.failed} skipped={run.skipped} />
                    </div>
                  </td>
                  <td className="px-3 py-2">{run.source?.actor || "—"}</td>
                  <SourceCell run={run} />
                  <td className="px-3 py-2 font-mono text-xs">{run.queries?.join(" ") || "—"}</td>
                  <td className="px-3 py-2" title={(run.packs || []).map(packTitle).join(", ")}>
                    {packLabel(run.packs) || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {run.env || "—"} · {run.mode}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {run.passed} / {run.failed} / {run.skipped}
                  </td>
                  <td className="px-3 py-2">{fmtDur(run.elapsed_s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{list.loading ? "…" : t("emptyRuns")}</p>
      )}
      <Pager page={list.page} hasMore={list.hasMore} onPage={list.setPage} />
    </div>
  )
}

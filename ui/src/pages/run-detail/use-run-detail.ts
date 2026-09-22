import { useResource } from "@/hooks/use-resource"
import { api, type Comment, type EventRow, type Run } from "@/lib/api"
import { useCallback, useMemo, useState, type FormEvent } from "react"
import { useParams } from "react-router-dom"

const EVENT_PAGE_SIZE = 80
const REFRESH_INTERVAL_MS = 2000

export function useRunDetail() {
  const { id } = useParams()
  const [body, setBody] = useState("")
  const [caseId, setCaseId] = useState("")
  const [metric, setMetric] = useState("")

  const loader = useCallback(() => loadRun(id), [id])
  const { data, loading, error, reload: refresh } = useResource(loader, REFRESH_INTERVAL_MS)
  const run = data?.run
  const comments = data?.comments || []
  const events = data?.events || []
  const eventTotal = data?.eventTotal || 0

  const summaries = run?.case_summaries || []
  const selected = summaries.find((item) => item.id === caseId) || summaries[0]
  const seriesMap = (run?.metric_series || {})[selected?.id || ""] || {}
  const metricKeys = Object.keys(seriesMap)
  const activeMetric = metricKeys.includes(metric) ? metric : metricKeys[0] || ""
  const series = useMemo(
    () => (activeMetric ? [...(seriesMap[activeMetric] || [])].sort((a, b) => a.iter - b.iter) : []),
    [activeMetric, seriesMap],
  )
  const audit = run?.resource_audit || {}

  async function onComment(event: FormEvent) {
    event.preventDefault()
    if (!id || !body.trim()) return
    await api(`/api/runs/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body, case_id: selected?.id || "" }),
    })
    setBody("")
    refresh()
  }

  return { loading, error, run, summaries, selected, setCaseId, setMetric, audit, metricKeys, activeMetric, series, comments, body, setBody, onComment, events, eventTotal }
}

async function loadRun(id: string | undefined) {
  if (!id) throw new Error("缺少运行 ID")
  const [run, note, log] = await Promise.all([
    api<Run>(`/api/runs/${id}`),
    api<{ comments: Comment[] }>(`/api/runs/${id}/comments`),
    api<{ events: EventRow[]; total: number }>(`/api/runs/${id}/events?limit=${EVENT_PAGE_SIZE}`),
  ])
  return { run, comments: note.comments, events: log.events, eventTotal: log.total }
}

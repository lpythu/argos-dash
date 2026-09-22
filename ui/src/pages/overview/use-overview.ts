import { useResource } from "@/hooks/use-resource"
import { useCallback, useState } from "react"
import { api, type Overview, type Run } from "@/lib/api"
import { pageQS, type Page } from "@/lib/page"

const DEFAULT_HOURS = 24
const RECENT_RUN_COUNT = 8
const REFRESH_INTERVAL_MS = 4000

export function useOverview() {
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [env, setEnv] = useState("all")
  const loader = useCallback(async () => {
    const query = new URLSearchParams({ hours: String(hours) })
    if (env !== "all") query.set("env", env)
    const [overview, runs, meta] = await Promise.all([
      api<Overview>(`/api/overview?${query}`),
      api<Page<Run>>(`/api/runs${pageQS({ page: 1, page_size: RECENT_RUN_COUNT }, Object.fromEntries(query))}`),
      api<{ envs: string[] }>("/api/envs"),
    ])
    return { overview, recent: runs.items, envs: meta.envs }
  }, [env, hours])
  const { data, loading, error, reload: load } = useResource(loader, REFRESH_INTERVAL_MS)
  return { hours, setHours, env, setEnv, envs: data?.envs || [], overview: data?.overview,
    recent: data?.recent || [], error, loading, load }
}

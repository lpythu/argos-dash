import { useResource } from "./use-resource"
import { useCallback, useState } from "react"
import { useSearchParams } from "react-router-dom"

import type { Page, PageQuery } from "@/lib/page"

export type UsePage<T> = {
  data: Page<T> | null
  items: T[]
  page: number
  pageSize: number
  hasMore: boolean
  empty: boolean
  loading: boolean
  error: string
  reload: () => void
  setPage: (n: number) => void
}

export function usePage<T>(
  loader: (q: PageQuery) => Promise<Page<T>>,
  deps: readonly unknown[] = [],
  opts?: { param?: string; pageSize?: number; url?: boolean; intervalMs?: number },
): UsePage<T> {
  const url = opts?.url !== false
  const param = opts?.param || "page"
  const pageSize = opts?.pageSize ?? 20
  const intervalMs = opts?.intervalMs
  const [sp, setSp] = useSearchParams()
  const [local, setLocal] = useState(1)
  const page = url ? Math.max(1, Number(sp.get(param) || 1) || 1) : local
  // Caller dependencies identify the query independently of inline loader identity.
  const load = useCallback(() => loader({ page, page_size: pageSize }), [page, pageSize, ...deps])
  const { data, loading, error, reload } = useResource(load, intervalMs)

  function setPage(n: number) {
    const next = Math.max(1, n)
    if (!url) {
      setLocal(next)
      return
    }
    const q = new URLSearchParams(sp)
    if (next <= 1) q.delete(param)
    else q.set(param, String(next))
    setSp(q, { replace: true })
  }

  const items = data?.items || []
  return {
    data,
    items,
    page,
    pageSize,
    hasMore: Boolean(data?.has_more),
    empty: Boolean(data) && items.length === 0,
    loading,
    error,
    reload,
    setPage,
  }
}

import { useCallback, useEffect, useState } from "react"
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
  const [data, setData] = useState<Page<T> | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const page = url ? Math.max(1, Number(sp.get(param) || 1) || 1) : local

  const load = useCallback(
    async (soft: boolean) => {
      if (!soft) setLoading(true)
      try {
        const next = await loader({ page, page_size: pageSize })
        setData(next)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed")
      } finally {
        setLoading(false)
      }
    },
    // loader identity is owned by the caller; deps identify the resource
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, ...deps],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    if (!intervalMs) return
    const timer = window.setInterval(() => void load(true), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, load])

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
    reload: () => void load(true),
    setPage,
  }
}

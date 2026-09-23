import { useResource } from "./use-resource"
import { useCallback } from "react"

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
  deps: readonly unknown[],
  opts: { page: number; setPage: (page: number) => void; pageSize?: number; intervalMs?: number },
): UsePage<T> {
  const { page, setPage, intervalMs } = opts
  const pageSize = opts.pageSize ?? 20
  // Caller dependencies identify the query independently of inline loader identity.
  const load = useCallback(() => loader({ page, page_size: pageSize }), [page, pageSize, ...deps])
  const { data, loading, error, reload } = useResource(load, intervalMs)

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

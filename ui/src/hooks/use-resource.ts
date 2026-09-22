import { useCallback, useEffect, useState } from "react"

// The memoized loader identifies a resource; background refresh retains its content.
export function useResource<T>(loader: () => Promise<T>, intervalMs?: number) {
  const [state, setState] = useState<{
    loader: typeof loader; data: T | null; loading: boolean; error: string
  }>({ loader, data: null, loading: true, error: "" })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    let active = true
    let pending = false
    async function load() {
      if (pending) return
      pending = true
      try {
        const data = await loader()
        if (active) setState({ loader, data, loading: false, error: "" })
      } catch (cause) {
        if (active) setState((previous) => ({
          loader, data: previous.loader === loader ? previous.data : null,
          loading: false, error: cause instanceof Error ? cause.message : String(cause),
        }))
      } finally {
        pending = false
      }
    }
    void load()
    const timer = intervalMs ? window.setInterval(() => void load(), intervalMs) : undefined
    return () => { active = false; window.clearInterval(timer) }
  }, [loader, intervalMs, revision])

  const current = state.loader === loader ? state : { data: null, loading: true, error: "" }
  return { data: current.data, loading: current.loading, error: current.error, reload }
}

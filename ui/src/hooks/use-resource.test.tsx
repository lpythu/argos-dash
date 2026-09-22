import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { PageSkeleton } from "@/components/page-skeleton"
import { useResource } from "./use-resource"

afterEach(() => { cleanup(); vi.useRealTimers() })
const POLL_MS = 4000

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function Fixture({ loader }: { loader: () => Promise<string> }) {
  const { data, loading, error } = useResource(loader, POLL_MS)
  if (loading) return <PageSkeleton />
  return <>{error ? <div role="alert">{error}</div> : null}<p>{data}</p></>
}

it("shows accessible skeletons until the initial request settles", async () => {
  const request = deferred<string>()
  const loader = () => request.promise
  const { container } = render(<Fixture loader={loader} />)
  expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true")
  expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  await act(async () => request.resolve("loaded"))
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByText("loaded")).toBeTruthy()
})

it("replaces loading with an explicit error on failure", async () => {
  const request = deferred<string>()
  render(<Fixture loader={() => request.promise} />)
  await act(async () => request.reject(new Error("network unavailable")))
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByRole("alert").textContent).toBe("network unavailable")
})

it("keeps existing content during polling and reports refresh failures", async () => {
  vi.useFakeTimers()
  const refresh = deferred<string>()
  const loader = vi.fn().mockResolvedValueOnce("existing").mockReturnValue(refresh.promise)
  render(<Fixture loader={loader} />)
  await act(async () => {})
  await act(async () => vi.advanceTimersByTime(POLL_MS))
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByText("existing")).toBeTruthy()
  await act(async () => refresh.reject(new Error("refresh failed")))
  expect(screen.getByRole("alert").textContent).toBe("refresh failed")
  expect(screen.getByText("existing")).toBeTruthy()
})

it("shows a new skeleton on resource changes and ignores late old responses", async () => {
  const old = deferred<string>()
  const next = deferred<string>()
  const { rerender } = render(<Fixture loader={() => old.promise} />)
  rerender(<Fixture loader={() => next.promise} />)
  await act(async () => next.resolve("new page"))
  await act(async () => old.resolve("old page"))
  expect(screen.getByText("new page")).toBeTruthy()
  expect(screen.queryByText("old page")).toBeNull()
  const third = deferred<string>()
  rerender(<Fixture loader={() => third.promise} />)
  expect(screen.getByRole("status")).toBeTruthy()
  expect(screen.queryByText("new page")).toBeNull()
})

it("does not start overlapping poll requests or keep polling after unmount", async () => {
  vi.useFakeTimers()
  const request = deferred<string>()
  const loader = vi.fn(() => request.promise)
  const { unmount } = render(<Fixture loader={loader} />)
  await act(async () => vi.advanceTimersByTime(POLL_MS * 3))
  expect(loader).toHaveBeenCalledTimes(1)
  unmount()
  await act(async () => request.resolve("finished"))
  await act(async () => vi.advanceTimersByTime(POLL_MS))
  expect(loader).toHaveBeenCalledTimes(1)
})

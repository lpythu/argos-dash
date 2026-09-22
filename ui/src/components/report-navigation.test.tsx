import { afterEach, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Pager } from "./pager"
import { t } from "@/lib/i18n"
import { ReportView } from "@/report-view"

afterEach(cleanup)

it("preserves pagination boundaries and invokes the next page", async () => {
  const onPage = vi.fn()
  const user = userEvent.setup()
  const { rerender } = render(<Pager page={1} hasMore onPage={onPage} />)
  await user.click(screen.getByRole("button", { name: t("prev") }))
  expect(onPage).not.toHaveBeenCalled()
  await user.click(screen.getByRole("button", { name: t("next") }))
  expect(onPage).toHaveBeenLastCalledWith(2)
  rerender(<Pager page={2} hasMore={false} onPage={onPage} />)
  await user.click(screen.getByRole("button", { name: t("next") }))
  expect(onPage).toHaveBeenCalledTimes(1)
  await user.click(screen.getByRole("button", { name: t("prev") }))
  expect(onPage).toHaveBeenLastCalledWith(1)
})

it("renders shared report tables and allows failed evidence to collapse", async () => {
  const user = userEvent.setup()
  const { container } = render(<ReportView report={{
    status: "fail", failed: 1,
    cases: [{
      id: "case-a", iteration: 1, status: "fail", error: "Connection failed",
      metrics: { latency: 12 },
      steps: [{
        name: "connect", status: "failed",
        operations: [{ label: "Connection evidence", type: "command", expected: { returncode: 0 }, actual: { returncode: 1 }, artifacts: ["log.txt"] }],
      }],
    }],
    artifacts: [{ path: "log.txt", bytes: 12 }],
  }} artifactHref={(path) => "/files/" + path} />)
  expect(screen.getAllByRole("table").length).toBeGreaterThan(0)
  expect(container.querySelector("details")).toBeNull()
  expect(container.querySelector('[data-slot="badge"]')).not.toBeNull()
  const evidence = screen.getByRole("button", { name: /Connection evidence/ })
  expect(evidence.getAttribute("aria-expanded")).toBe("true")
  await user.click(evidence)
  expect(evidence.getAttribute("aria-expanded")).toBe("false")
  expect(screen.getAllByRole("link", { name: "log.txt" }).every(link => link.getAttribute("href") === "/files/log.txt")).toBe(true)
})

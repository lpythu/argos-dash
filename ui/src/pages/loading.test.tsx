import { t } from "@/lib/i18n"
import { act, cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { CasesPage } from "./cases"
import { RunsPage } from "./runs"
import { HomePage } from "./home"
import { RunDetailPage } from "./run-detail"
import { ReportPage } from "./report"
import { PlanPage } from "./plan"
import { CliPage } from "./cli"
import { SkillPage } from "./skill"

vi.mock("@/lib/api", async (original) => ({
  ...await original<typeof import("@/lib/api")>(), api: vi.fn(),
}))
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals() })

it.each([
  ["总览", <HomePage />], ["用例库", <CasesPage />], ["记录", <RunsPage />],
  ["规划", <PlanPage />], ["CLI", <CliPage />],
])("renders skeletons immediately in %s", (_name, element) => {
  vi.mocked(api).mockReturnValue(new Promise(() => {}))
  render(<MemoryRouter>{element}</MemoryRouter>)
  expect(screen.getByRole("status", { name: t("loading") })).toBeTruthy()
})

it.each([
  ["/runs/run-1", "/runs/:id", <RunDetailPage />],
  ["/runs/run-1/report", "/runs/:id/report", <ReportPage />],
])("renders skeletons for %s", (path, route, element) => {
  vi.mocked(api).mockReturnValue(new Promise(() => {}))
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path={route} element={element} />
  </Routes></MemoryRouter>)
  expect(screen.getByRole("status", { name: t("loading") })).toBeTruthy()
})

it("shows list errors instead of misleading empty content or endless skeletons", async () => {
  vi.mocked(api).mockRejectedValue(new Error("catalog unavailable"))
  render(<MemoryRouter><CasesPage /></MemoryRouter>)
  await act(async () => {})
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByRole("alert").textContent).toContain("catalog unavailable")
  expect(screen.queryByText(t("emptyCases"))).toBeNull()
})

it("shows an actual empty list after a successful empty response", async () => {
  vi.mocked(api).mockResolvedValue({ items: [], packs: [], groups: [], has_more: false })
  render(<MemoryRouter><CasesPage /></MemoryRouter>)
  await act(async () => {})
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByText(t("emptyCases"))).toBeTruthy()
})

it("shows Skill skeletons and surfaces HTTP failures", async () => {
  let finish!: (value: Response) => void
  vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => { finish = resolve })))
  render(<MemoryRouter><SkillPage /></MemoryRouter>)
  expect(screen.getByRole("status")).toBeTruthy()
  expect((screen.getByRole("button", { name: t("copySkill") }) as HTMLButtonElement).disabled).toBe(true)
  await act(async () => finish(new Response("missing", { status: 404 })))
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.getByRole("alert").textContent).toContain("404")
})

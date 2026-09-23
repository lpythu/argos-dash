import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router-dom"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { api, type CatalogCase } from "@/lib/api"
import { clearPlan } from "@/lib/plan"
import { t } from "@/lib/i18n"
import { RunsPage } from "../runs"
import { CasesPage } from "../cases"
import { listText } from "./shared"

vi.mock("@/lib/api", async (original) => ({
  ...await original<typeof import("@/lib/api")>(), api: vi.fn(),
}))
const CASE: CatalogCase = {
  id: "case-a", title: "Alpha", pack: "pack-a", group: "group-a", slug: "", status: "pass",
  env: "office", mode: "once", run_id: "run-1", run_slug: "", seen_at: "",
  typical_s: 60, mutex: "", resources: [], prefer_after: [], modes: [], tags: [],
}
function response(path: string) {
  if (path === "/api/envs") return { envs: ["office"] }
  const query = new URL(path, "https://example.test").searchParams
  return { items: [], packs: ["pack-a"], groups: ["group-a"], has_more: true, page: Number(query.get("page")), page_size: 20 }
}
beforeEach(() => { clearPlan(); vi.mocked(api).mockImplementation(async (path) => response(path) as never) })
afterEach(() => { cleanup(); clearPlan(); vi.resetAllMocks() })
function Location() {
  return <output data-testid="location">{useLocation().search}</output>
}
function mount(kind: "runs" | "cases") {
  const user = userEvent.setup()
  render(<MemoryRouter initialEntries={[`/${kind}?page=4&keep=yes`]}>
    {kind === "runs" ? <RunsPage /> : <CasesPage />}<Location />
  </MemoryRouter>)
  return user
}
async function advancePage(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: t("next") }))
  await screen.findByText(t("pageN", { n: 2 }))
  expect(screen.getByTestId("location").textContent).toBe("?page=4&keep=yes")
}
function filteredCalls(key: string) {
  return vi.mocked(api).mock.calls.map(([path]) => new URL(path, "https://example.test"))
    .filter((url) => url.searchParams.has(key))
}

it.each(["runs", "cases"] as const)("resets %s searches to page one without requests for the previous page", async (kind) => {
  const user = mount(kind)
  await screen.findByText(t(kind === "runs" ? "emptyRuns" : "emptyCases"))
  await advancePage(user)
  await user.type(screen.getByRole("textbox", { name: kind === "runs" ? listText.runSearch : listText.caseSearch }), "x")
  await screen.findByText(listText.noMatches)
  expect(filteredCalls("q").length).toBeGreaterThan(0)
  expect(filteredCalls("q").every((url) => url.searchParams.get("page") === "1")).toBe(true)
  expect(screen.getByTestId("location").textContent).toBe("?page=4&keep=yes")
  await user.click(screen.getAllByRole("button", { name: listText.reset })[0])
  await screen.findByText(t(kind === "runs" ? "emptyRuns" : "emptyCases"))
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("")
})

it.each([
  ["runs", "env", "office"], ["runs", "status", "pass"],
  ["cases", "pack", "pack-a"], ["cases", "group", "group-a"],
] as const)("resets the page when %s %s changes", async (kind, key, option) => {
  const user = mount(kind)
  await screen.findByText(t(kind === "runs" ? "emptyRuns" : "emptyCases"))
  await advancePage(user)
  await user.click(screen.getByRole("combobox", { name: t(key) }))
  await user.click(await screen.findByRole("option", { name: option }))
  await screen.findByText(listText.noMatches)
  expect(filteredCalls(key).length).toBeGreaterThan(0)
  expect(filteredCalls(key).every((url) => url.searchParams.get("page") === "1")).toBe(true)
  expect(screen.getByTestId("location").textContent).toBe("?page=4&keep=yes")
})

it("adds only displayed cases, retains selection during filtering, and disables empty-page addition", async () => {
  vi.mocked(api).mockImplementation(async (path) => {
    const data = response(path)
    return { ...data, items: path.includes("q=") ? [] : [CASE] } as never
  })
  const user = mount("cases")
  await screen.findByText("Alpha")
  await user.click(screen.getByRole("button", { name: listText.addPage }))
  expect(screen.getByRole("link", { name: `${t("plan")} (1)` })).toBeTruthy()
  await user.type(screen.getByRole("textbox", { name: listText.caseSearch }), "missing")
  await screen.findByText(listText.noMatches)
  expect((screen.getByRole("button", { name: listText.addPage }) as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByRole("link", { name: `${t("plan")} (1)` })).toBeTruthy()
  await user.click(screen.getAllByRole("button", { name: listText.reset })[0])
  await waitFor(() => expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("true"))
})

it.each([["runs", 9], ["cases", 8]] as const)("matches the %s loading table column count", (kind, columns) => {
  vi.mocked(api).mockReturnValue(new Promise(() => {}))
  mount(kind)
  expect(screen.getByRole("status", { name: t("loading") }).querySelectorAll("col")).toHaveLength(columns)
})

it.each(["runs", "cases"] as const)("clears %s filters and pagination on remount and ignores URL list state", async (kind) => {
  const user = mount(kind)
  const searchName = kind === "runs" ? listText.runSearch : listText.caseSearch
  await screen.findByText(t("pageN", { n: 1 }))
  await user.type(screen.getByRole("textbox", { name: searchName }), "query")
  await screen.findByText(listText.noMatches)
  await advancePage(user)
  cleanup()
  vi.mocked(api).mockClear()
  mount(kind)
  await screen.findByText(t("pageN", { n: 1 }))
  expect((screen.getByRole("textbox", { name: searchName }) as HTMLInputElement).value).toBe("")
  expect(filteredCalls("q")).toHaveLength(0)
  expect(filteredCalls("page").every((url) => url.searchParams.get("page") === "1")).toBe(true)
})

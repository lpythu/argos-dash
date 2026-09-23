import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { api, type CatalogCase } from "@/lib/api"
import { t } from "@/lib/i18n"
import { addPlan, clearPlan } from "@/lib/plan"
import { PlanPage } from "../plan"
import { planText } from "./messages"

vi.mock("@/lib/api", async (original) => ({
  ...await original<typeof import("@/lib/api")>(), api: vi.fn(),
}))
const BASE: CatalogCase = {
  id: "case-a", title: "Alpha", pack: "pack-a", group: "", slug: "", status: "pass",
  env: "office", mode: "once", run_id: "run-1", run_slug: "", seen_at: "",
  typical_s: 60, mutex: "gpu", resources: [], prefer_after: [], modes: [], tags: [],
}
const ITEMS = [BASE, { ...BASE, id: "case-b", title: "Beta", pack: "pack-b", prefer_after: [BASE.id] }]
beforeEach(() => {
  clearPlan()
  vi.mocked(api).mockResolvedValue({ items: ITEMS, envs: ["office", "hk"], packs: [], groups: [], has_more: false })
})
afterEach(() => { cleanup(); clearPlan(); vi.restoreAllMocks() })

async function openPlan() {
  const user = userEvent.setup()
  render(<MemoryRouter><PlanPage /></MemoryRouter>)
  await screen.findByRole("checkbox", { name: /case-a/ })
  return user
}

it("keeps selection when filtering, then synchronizes removal and clear with checkboxes", async () => {
  const user = await openPlan()
  await user.click(screen.getByRole("checkbox", { name: /case-a/ }))
  const search = screen.getByRole("textbox", { name: planText.search })
  await user.type(search, "Beta")
  expect(screen.queryByRole("checkbox", { name: /case-a/ })).toBeNull()
  expect(within(screen.getByRole("list", { name: planText.selection })).getByText("Alpha")).toBeTruthy()
  await user.click(screen.getByRole("checkbox", { name: /case-b/ }))
  await user.clear(search)
  expect(screen.getByRole("checkbox", { name: /case-a/ }).getAttribute("aria-checked")).toBe("true")
  await user.click(screen.getByRole("button", { name: `${planText.remove} ${BASE.id}` }))
  expect(screen.getByRole("checkbox", { name: /case-a/ }).getAttribute("aria-checked")).toBe("false")
  await user.click(screen.getByRole("button", { name: planText.clearAll }))
  expect(screen.getByRole("checkbox", { name: /case-b/ }).getAttribute("aria-checked")).toBe("false")
  expect((screen.getByRole("button", { name: t("copyCmd") }) as HTMLButtonElement).disabled).toBe(true)
})

it("combines pack and case search and gives an explicit no-results state", async () => {
  const user = await openPlan()
  await user.click(screen.getByRole("combobox", { name: t("pack") }))
  await user.click(await screen.findByRole("option", { name: "pack-b" }))
  expect(screen.queryByRole("checkbox", { name: /case-a/ })).toBeNull()
  expect(screen.getByRole("checkbox", { name: /case-b/ })).toBeTruthy()
  await user.type(screen.getByRole("textbox", { name: planText.search }), "Alpha")
  expect(screen.getByText(planText.noMatch)).toBeTruthy()
  expect(screen.queryByRole("checkbox", { name: /case-b/ })).toBeNull()
})

it("updates soak options and copies the displayed command, while once mode omits soak flags", async () => {
  const user = await openPlan()
  const clipboard = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
  await user.click(screen.getByRole("checkbox", { name: /case-a/ }))
  expect(screen.queryByRole("textbox", { name: t("duration") })).toBeNull()
  await user.click(screen.getByRole("combobox", { name: t("mode") }))
  await user.click(await screen.findByRole("option", { name: planText.soak }))
  const duration = screen.getByRole("textbox", { name: t("duration") })
  await user.clear(duration)
  await user.type(duration, "2h")
  await user.click(screen.getByRole("checkbox", { name: planText.failFast }))
  const expected = "argos run case-a --env office --soak --for 2h --pause 2m --fail-fast --dash"
  expect(within(screen.getByRole("region", { name: planText.command })).getByText(expected)).toBeTruthy()
  await user.click(screen.getByRole("button", { name: t("copyCmd") }))
  expect(clipboard).toHaveBeenCalledWith(expected)
  await user.click(screen.getByRole("combobox", { name: t("mode") }))
  await user.click(await screen.findByRole("option", { name: planText.once }))
  expect(screen.queryByRole("textbox", { name: t("duration") })).toBeNull()
  await user.click(screen.getByRole("button", { name: t("copyCmd") }))
  expect(clipboard).toHaveBeenLastCalledWith("argos run case-a --env office --fail-fast --dash")
})

it("shows conflicts and ordering notes for selected cases", async () => {
  addPlan(ITEMS.map((item) => item.id))
  await openPlan()
  expect(screen.getByText(`${t("conflict")}: gpu · case-a, case-b`)).toBeTruthy()
  expect(screen.getByText(`${t("preferAfter")}: case-a → case-b`)).toBeTruthy()
})

it("keeps uncatalogued selections visible and removable", async () => {
  addPlan(["missing-case"])
  const user = await openPlan()
  expect(screen.getByText(planText.missing)).toBeTruthy()
  await user.click(screen.getByRole("button", { name: `${planText.remove} missing-case` }))
  expect(screen.queryByText(planText.missing)).toBeNull()
})

it("surfaces clipboard errors", async () => {
  const user = await openPlan()
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("clipboard denied"))
  await user.click(screen.getByRole("checkbox", { name: /case-a/ }))
  await user.click(screen.getByRole("button", { name: t("copyCmd") }))
  expect(screen.getByRole("alert").textContent).toContain("clipboard denied")
})

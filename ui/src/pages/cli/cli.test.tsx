import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { t } from "@/lib/i18n"
import { CliPage } from "../cli"
import { CONFIG_DOWNLOAD, RUN_EXAMPLE, cliText, type CliConfig } from "./shared"

vi.mock("@/lib/api", async (original) => ({
  ...await original<typeof import("@/lib/api")>(), api: vi.fn(),
}))
const CONFIG: CliConfig = {
  url: "https://example.test", token: "fixture-token",
  env: "ARGOS_DASH_URL=https://example.test\nARGOS_TOKEN=fixture-token\n",
  library_skill: "https://example.test/library/skill.md",
}
beforeEach(() => { vi.mocked(api).mockResolvedValue(CONFIG) })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

async function openCli() {
  const user = userEvent.setup()
  render(<MemoryRouter><CliPage /></MemoryRouter>)
  await screen.findByLabelText(t("cliOrigin"))
  return user
}

it("keeps download and navigation as links and puts setup before connection details", async () => {
  await openCli()
  const download = screen.getByRole("link", { name: t("cliDownload") })
  expect(download.getAttribute("href")).toBe(CONFIG_DOWNLOAD)
  expect(download.getAttribute("download")).toBe("dash.env")
  expect(screen.getByRole("link", { name: cliText.plan }).getAttribute("href")).toBe("/plan")
  expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent))
    .toEqual([cliText.download, cliText.run, cliText.connection, t("cliLibrary")])
  expect(screen.getByLabelText("dash.env").textContent).toBe(CONFIG.env)
})

it("masks token initially and supports reveal and hide", async () => {
  const user = await openCli()
  const token = screen.getByLabelText(t("cliToken")) as HTMLInputElement
  expect(token.type).toBe("password")
  await user.click(screen.getByRole("button", { name: t("cliReveal") }))
  expect(token.type).toBe("text")
  expect(token.value).toBe(CONFIG.token)
  await user.click(screen.getByRole("button", { name: t("cliHide") }))
  expect(token.type).toBe("password")
})

it("copies exact configuration, command and connection values with feedback on each action", async () => {
  const user = await openCli()
  const clipboard = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
  const actions = [
    [t("copyEnv"), CONFIG.env], [t("copyCmd"), RUN_EXAMPLE],
    [cliText.copyUrl, CONFIG.url], [cliText.copyToken, CONFIG.token],
    [t("copyInstall"), `Install ${CONFIG.library_skill}`],
  ]
  for (const [label, value] of actions) {
    await user.click(screen.getByRole("button", { name: label }))
    expect(clipboard).toHaveBeenLastCalledWith(value)
    expect(screen.getByRole("button", { name: `${t("copied")}: ${label}` }).textContent).toBe(t("copied"))
  }
})

it("shows copy errors without reporting success", async () => {
  const user = await openCli()
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("clipboard denied"))
  await user.click(screen.getByRole("button", { name: t("copyEnv") }))
  expect(screen.getByRole("alert").textContent).toContain("clipboard denied")
  expect(screen.queryByRole("button", { name: `${t("copied")}: ${t("copyEnv")}` })).toBeNull()
})

it("shows actual loading failures instead of labeling every error a missing token", async () => {
  vi.mocked(api).mockRejectedValue(new Error("service unavailable"))
  render(<MemoryRouter><CliPage /></MemoryRouter>)
  expect((await screen.findByRole("alert")).textContent).toContain("service unavailable")
  expect(screen.queryByText(t("cliTokenMissing"))).toBeNull()
  expect(screen.queryByRole("status")).toBeNull()
})

import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, expect, it, vi } from "vitest"
import { t } from "@/lib/i18n"
import { SkillPage } from "../skill"
import { parseHeadings } from "./headings"
import { skillText } from "./shared"

const DOCUMENT = "# Instance\n\n## Connect **CLI**\n\nUse `dash.env`.\n\n### Run locally\n\n```bash\n## not a heading\nargos run example\n```\n\n## Connect **CLI**\n\n[First section](#connect-cli)\n\n## 中文章节\n"
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function openSkill(text = DOCUMENT) {
  const user = userEvent.setup()
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(text)))
  render(<MemoryRouter><SkillPage /></MemoryRouter>)
  await screen.findByRole("article", { name: skillText.document })
  return user
}

it("parses formatted headings, duplicate anchors, setext headings and non-Latin titles", () => {
  const { sections } = parseHeadings(`${DOCUMENT}\nAnother section\n---\n\n## Connect CLI-1\n`)
  expect(sections.map((item) => item.title)).toEqual([
    "Connect CLI", "Run locally", "Connect CLI", "中文章节", "Another section", "Connect CLI-1",
  ])
  expect(new Set(sections.map((item) => item.id)).size).toBe(sections.length)
  expect(sections[2].id).toBe("skill-connect-cli-1")
  expect(sections[5].id).toBe("skill-connect-cli-1-1")
})

it("links every TOC entry to a rendered heading and keeps internal document links working", async () => {
  await openSkill()
  const toc = screen.getByRole("navigation", { name: skillText.contents })
  for (const link of within(toc).getAllByRole("link")) {
    const target = decodeURIComponent(link.getAttribute("href")!.slice(1))
    expect(document.getElementById(target)?.textContent).toBe(link.textContent)
  }
  expect(screen.getByRole("link", { name: "First section" }).getAttribute("href")).toBe("#skill-connect-cli")
  expect(within(toc).queryByText("not a heading")).toBeNull()
  expect(screen.getByRole("link", { name: skillText.cli }).getAttribute("href")).toBe("/cli")
})

it("opens the mobile chapter disclosure", async () => {
  const user = await openSkill()
  const trigger = screen.getByRole("button", { name: skillText.contents })
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  await user.click(trigger)
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  await user.click(trigger)
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
})

it("copies the original Markdown and current-instance install instruction independently", async () => {
  const user = await openSkill()
  const clipboard = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
  await user.click(screen.getByRole("button", { name: t("copySkill") }))
  expect(clipboard).toHaveBeenLastCalledWith(DOCUMENT)
  expect(screen.getByRole("button", { name: `${t("copied")}: ${t("copySkill")}` })).toBeTruthy()
  await user.click(screen.getByRole("button", { name: t("copyInstall") }))
  expect(clipboard).toHaveBeenLastCalledWith(`Install ${window.location.origin}/skill.md`)
})

it("omits the TOC for a document without sections and surfaces copy failures", async () => {
  const user = await openSkill("# Short document\n\nA paragraph.")
  expect(screen.queryByRole("navigation", { name: skillText.contents })).toBeNull()
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("clipboard denied"))
  await user.click(screen.getByRole("button", { name: t("copySkill") }))
  expect(screen.getByRole("alert").textContent).toContain("clipboard denied")
})

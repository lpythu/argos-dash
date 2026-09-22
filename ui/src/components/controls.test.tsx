import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, expect, it } from "vitest"
import { Disclosure } from "./disclosure"
import { SelectField } from "./select-field"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableRow } from "./ui/table"

afterEach(cleanup)
const ITEMS = [{ value: "all", label: "全部环境" }, { value: "office", label: "办公室" }]
function SelectFixture({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState("all")
  return <SelectField label="环境" value={value} onValueChange={setValue} items={ITEMS} disabled={disabled} />
}
function CheckboxFixture() {
  const [checked, setChecked] = useState(false)
  return <Label><Checkbox checked={checked} onCheckedChange={setChecked} />停止失败任务</Label>
}

it("selects translated labels while retaining option values", async () => {
  const user = userEvent.setup()
  const { container } = render(<SelectFixture />)
  const trigger = screen.getByRole("combobox", { name: "环境" })
  expect(trigger.textContent).toContain("全部环境")
  expect(container.querySelector("select")).toBeNull()
  await user.click(trigger)
  await user.click(await screen.findByRole("option", { name: "办公室" }))
  expect(trigger.textContent).toContain("办公室")
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
})
it("supports keyboard selection and Escape without changing selection", async () => {
  const user = userEvent.setup()
  render(<SelectFixture />)
  const trigger = screen.getByRole("combobox", { name: "环境" })
  trigger.focus()
  await user.keyboard("{ArrowDown}")
  await screen.findByRole("listbox")
  await user.keyboard("{End}{Enter}")
  expect(trigger.textContent).toContain("办公室")
  await waitFor(() => {
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(trigger)
  })
  await user.click(trigger)
  await screen.findByRole("listbox")
  await user.keyboard("{Escape}")
  await waitFor(() => {
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(trigger)
  })
  expect(trigger.textContent).toContain("办公室")
})
it("keeps disabled selects closed", async () => {
  const user = userEvent.setup()
  render(<SelectFixture disabled />)
  await user.click(screen.getByRole("combobox", { name: "环境" }))
  expect(screen.queryByRole("listbox")).toBeNull()
})
it("toggles a checkbox from its label and keyboard", async () => {
  const user = userEvent.setup()
  render(<CheckboxFixture />)
  const checkbox = screen.getByRole("checkbox", { name: "停止失败任务" })
  await user.click(screen.getByText("停止失败任务"))
  expect(checkbox.getAttribute("aria-checked")).toBe("true")
  checkbox.focus()
  await user.keyboard(" ")
  expect(checkbox.getAttribute("aria-checked")).toBe("false")
})
it("expands and collapses evidence without submitting its enclosing form", async () => {
  const user = userEvent.setup()
  let submits = 0
  render(<form onSubmit={(event) => { event.preventDefault(); submits += 1 }}>
    <Disclosure title="操作证据" defaultOpen><p>预期结果</p></Disclosure>
    <Button type="submit">提交</Button>
  </form>)
  const trigger = screen.getByRole("button", { name: "操作证据" })
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  await user.click(trigger)
  expect(trigger.getAttribute("aria-expanded")).toBe("false")
  await user.click(trigger)
  expect(trigger.getAttribute("aria-expanded")).toBe("true")
  expect(submits).toBe(0)
  await user.click(screen.getByRole("button", { name: "提交" }))
  expect(submits).toBe(1)
})
it("retains status variants and valid table structure inside CardContent", () => {
  const { container } = render(<Card><CardContent>
    <Table><TableBody><TableRow><TableCell><Badge variant="fail">失败</Badge></TableCell></TableRow></TableBody></Table>
  </CardContent></Card>)
  expect(within(screen.getByRole("table")).getByRole("cell").textContent).toBe("失败")
  expect(container.querySelector('[data-slot="badge"]')?.className).toContain("text-destructive")
  expect(container.querySelector('[data-slot="card-content"] table')).not.toBeNull()
})

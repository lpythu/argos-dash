import { useMemo, useState } from "react"
import { SelectField } from "@/components/select-field"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CatalogCase } from "@/lib/api"
import { fmtDur } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { togglePlan } from "@/lib/plan"
import { LIST_CARD, LIST_CONTENT, LIST_SCROLL } from "./layout"
import { planText } from "./messages"

export function CatalogPanel({ items, ids }: { items: readonly CatalogCase[]; ids: readonly string[] }) {
  const [query, setQuery] = useState("")
  const [pack, setPack] = useState("all")
  const packs = useMemo(() => [...new Set(items.map((item) => item.pack).filter(Boolean))].sort(), [items])
  const needle = query.trim().toLowerCase()
  const selected = new Set(ids)
  const visible = items.filter((item) => (pack === "all" || item.pack === pack)
    && `${item.title} ${item.id}`.toLowerCase().includes(needle))
  return <Card className={LIST_CARD}>
    <CardContent className={LIST_CONTENT}>
      <div className="flex items-center gap-2"><CardTitle>{t("cases")}</CardTitle>
        <Badge variant="secondary">{visible.length} / {items.length}</Badge></div>
      <div className="flex flex-wrap gap-2">
        <Input className="min-w-0 flex-1 basis-40" aria-label={planText.search}
          placeholder={planText.search} value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectField label={t("pack")} value={pack} onValueChange={setPack}
          items={[{ value: "all", label: planText.allPacks }, ...packs.map((value) => ({ value, label: value }))]} />
      </div>
      <ul className={LIST_SCROLL} aria-label={t("cases")}>
        {visible.map((item) => <CatalogItem key={item.id} item={item} checked={selected.has(item.id)} />)}
      </ul>
      {!visible.length ? <p className="text-sm text-muted-foreground">{items.length ? planText.noMatch : t("emptyCases")}</p> : null}
    </CardContent>
  </Card>
}

function CatalogItem({ item, checked }: { item: CatalogCase; checked: boolean }) {
  return <li className={`rounded-lg border ${checked ? "border-primary/30 bg-muted/60" : "border-transparent"}`}>
    <Label className="flex cursor-pointer items-start gap-3 p-3">
      <Checkbox className="mt-0.5" checked={checked} onCheckedChange={() => togglePlan(item.id)} />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block leading-snug wrap-anywhere">{item.title || item.id}</span>
        <code className="block text-xs font-normal text-muted-foreground wrap-anywhere">{item.id}</code>
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground">
          <span>{item.pack || "—"}</span><span>{t("typical")}: {item.typical_s ? fmtDur(item.typical_s) : "—"}</span>
        </span>
      </span>
    </Label>
  </li>
}

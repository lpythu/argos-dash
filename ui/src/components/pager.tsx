import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export function Pager({
  page,
  hasMore,
  onPage,
}: {
  page: number
  hasMore: boolean
  onPage: (n: number) => void
}) {
  if (page <= 1 && !hasMore) return null
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeftIcon className="size-4" />
        <span className="sr-only">{t("prev")}</span>
      </Button>
      <span className="text-sm text-muted-foreground">{t("pageN", { n: page })}</span>
      <Button type="button" variant="outline" size="sm" disabled={!hasMore} onClick={() => onPage(page + 1)}>
        <ChevronRightIcon className="size-4" />
        <span className="sr-only">{t("next")}</span>
      </Button>
    </div>
  )
}

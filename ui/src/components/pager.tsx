import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
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
    <Pagination className="justify-end"><PaginationContent className="gap-2">
      <PaginationItem>
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeftIcon className="size-4" />
        <span className="sr-only">{t("prev")}</span>
      </Button>
      </PaginationItem>
      <PaginationItem><span aria-current="page" className="text-sm text-muted-foreground">{t("pageN", { n: page })}</span></PaginationItem>
      <PaginationItem>
      <Button type="button" variant="outline" size="sm" disabled={!hasMore} onClick={() => onPage(page + 1)}>
        <ChevronRightIcon className="size-4" />
        <span className="sr-only">{t("next")}</span>
      </Button>
      </PaginationItem>
    </PaginationContent></Pagination>
  )
}

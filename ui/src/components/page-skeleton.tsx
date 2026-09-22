import { t } from "@/lib/i18n"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const TABLE_ROWS = 8
const METRICS = 6
const DOCUMENT_LINES = 7

export function LoadingRegion({ children }: { children: ReactNode }) {
  return <div role="status" aria-busy="true" aria-label={t("loading")} className="min-w-0 space-y-6">
    <span className="sr-only">{t("loadingHint")}</span>
    <div aria-hidden="true" className="min-w-0 space-y-6">{children}</div>
  </div>
}

function PanelPlaceholder() {
  return <Card className="gap-0 py-0"><CardContent className="space-y-4 p-5">
    <Skeleton className="h-5 w-32" />
    {Array.from({ length: DOCUMENT_LINES }, (_, index) =>
      <Skeleton key={index} className={index % 2 ? "h-4 w-2/3" : "h-4 w-full"} />)}
  </CardContent></Card>
}

function TablePlaceholder() {
  return <div className="overflow-hidden rounded-xl border">
    <div className="border-b bg-muted/40 p-4"><Skeleton className="h-4 w-1/3" /></div>
    {Array.from({ length: TABLE_ROWS }, (_, index) =>
      <div key={index} className="grid grid-cols-4 gap-6 border-b p-4 last:border-0">
        <Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-full" />
      </div>)}
  </div>
}

export function TableSkeleton() {
  return <LoadingRegion><TablePlaceholder /></LoadingRegion>
}

export function OverviewSkeleton() {
  return <LoadingRegion>
    <Skeleton className="h-16 w-full" />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: METRICS }, (_, index) => <Card key={index} className="gap-0 py-0">
        <CardContent className="space-y-3 p-5"><Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-28" /></CardContent>
      </Card>)}
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
      <div className="space-y-6"><PanelPlaceholder /><TablePlaceholder /></div>
      <PanelPlaceholder />
    </div>
  </LoadingRegion>
}

export function PageSkeleton({ layout = "detail" }: { layout?: "detail" | "document" | "config" }) {
  return <LoadingRegion>
    <Skeleton className="h-7 w-40" />
    <PanelPlaceholder />
    {layout === "detail" ? <TablePlaceholder /> : null}
    {layout !== "document" ? <div className="grid gap-4 lg:grid-cols-2">
      <PanelPlaceholder /><PanelPlaceholder />
    </div> : null}
  </LoadingRegion>
}

export function ShellSkeleton() {
  return <div className="min-h-svh">
    <header className="flex justify-between gap-6 border-b px-9 py-3" aria-hidden="true">
      <Skeleton className="h-8 w-96 max-w-full" /><Skeleton className="h-8 w-24" />
    </header>
    <main className="px-9 py-4 md:py-6"><PageSkeleton /></main>
  </div>
}

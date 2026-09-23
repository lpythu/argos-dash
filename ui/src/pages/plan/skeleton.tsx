import { LoadingRegion } from "@/components/page-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LIST_CARD, LIST_CONTENT, PLAN_GRID } from "./layout"

const PLACEHOLDER_ROWS = 6

export function PlanSkeleton() {
  return <LoadingRegion><div className={PLAN_GRID}>
    <ListPlaceholder /><ListPlaceholder />
    <Card className="min-w-0 gap-0 py-0 md:col-span-2 xl:col-span-1"><CardContent className="space-y-6 p-5">
      <Skeleton className="h-5 w-28" /><Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" /><Skeleton className="h-5 w-36" />
      <Skeleton className="h-20 w-full" /><Skeleton className="h-28 w-full" />
      <Skeleton className="h-8 w-full" />
    </CardContent></Card>
  </div></LoadingRegion>
}

function ListPlaceholder() {
  return <Card className={LIST_CARD}><CardContent className={LIST_CONTENT}>
    <Skeleton className="h-5 w-32 shrink-0" /><Skeleton className="h-8 w-full shrink-0" />
    <div className="min-h-0 space-y-2 overflow-hidden">
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => <div key={index} className="space-y-3 rounded-lg border p-3">
        <Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/3" />
      </div>)}
    </div>
  </CardContent></Card>
}

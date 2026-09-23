import { LoadingRegion } from "@/components/page-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SKILL_CARD, SKILL_GRID } from "./shared"

const PARAGRAPH_LINES = 5
export function SkillSkeleton() {
  return <LoadingRegion><div className={SKILL_GRID}>
    <div className="space-y-6 lg:col-start-2 lg:row-start-1">
      <Card className={SKILL_CARD}><CardContent className="space-y-4 p-5">
        <Skeleton className="h-5 w-40" /><Skeleton className="h-20 w-full" /><Skeleton className="h-8 w-28" />
      </CardContent></Card>
      <Skeleton className="h-32 w-full" />
    </div>
    <Card className={`${SKILL_CARD} lg:col-start-1 lg:row-start-1`}><CardContent className="space-y-6 p-5">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: PARAGRAPH_LINES }, (_, index) => <Skeleton key={index} className="h-4 w-3/4" />)}
      <Skeleton className="h-28 w-full" /><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-2/3" />
    </CardContent></Card>
  </div></LoadingRegion>
}

import { LoadingRegion } from "@/components/page-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CLI_CARD, CLI_CONTENT, CLI_GRID } from "./shared"

export function CliSkeleton() {
  return <LoadingRegion><div className={CLI_GRID}>
    <div className="min-w-0 space-y-6"><PanelPlaceholder /><PanelPlaceholder /></div>
    <div className="min-w-0 space-y-6"><PanelPlaceholder /><PanelPlaceholder /></div>
  </div></LoadingRegion>
}

function PanelPlaceholder() {
  return <Card className={CLI_CARD}><CardContent className={CLI_CONTENT}>
    <Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-24 w-full" /><Skeleton className="h-8 w-28" />
  </CardContent></Card>
}

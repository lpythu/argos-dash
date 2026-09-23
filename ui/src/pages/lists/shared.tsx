import { Button } from "@/components/ui/button"
import { LoadingRegion } from "@/components/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const zh = {
  reset: "清除筛选", noMatches: "当前筛选条件没有匹配结果", addPage: "加入本页用例",
  caseSearch: "搜索用例名称 / ID / Pack / 分组", runSearch: "搜索记录 / 来源 / Pack / 选择器",
  allPacks: "全部 Pack", allGroups: "全部分组", allStatuses: "全部状态",
}
const en: typeof zh = {
  reset: "Clear filters", noMatches: "No results match your filters", addPage: "Add this page to plan",
  caseSearch: "Search case name / ID / pack / group", runSearch: "Search run / source / pack / selector",
  allPacks: "All packs", allGroups: "All groups", allStatuses: "All statuses",
}
export const listText = navigator.language.toLowerCase().startsWith("zh") ? zh : en
export const LIST_TABLE = "w-full min-w-[1200px] table-fixed text-left text-sm"
const SKELETON_ROWS = 8
const COLUMN_WIDTHS = {
  runs: ["88px", "200px", "120px", "calc((100% - 728px) * 0.36)", "calc((100% - 728px) * 0.36)", "calc((100% - 728px) * 0.28)", "128px", "104px", "88px"],
  cases: ["44px", "calc((100% - 384px) * 0.35)", "calc((100% - 384px) * 0.18)", "108px", "calc((100% - 384px) * 0.25)", "112px", "120px", "calc((100% - 384px) * 0.22)"],
} as const
export type ListKind = keyof typeof COLUMN_WIDTHS

export function ListColumns({ kind }: { kind: ListKind }) {
  return <colgroup>{COLUMN_WIDTHS[kind].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
}

export function ListSkeleton({ kind }: { kind: ListKind }) {
  return <LoadingRegion><div className="overflow-hidden rounded-xl border">
    <Table className={LIST_TABLE}>
      <ListColumns kind={kind} />
      <TableHeader className="bg-muted/50"><TableRow>
        {COLUMN_WIDTHS[kind].map((_, index) => <TableHead key={index} className="px-3 py-3"><Skeleton className="h-4 w-full" /></TableHead>)}
      </TableRow></TableHeader>
      <TableBody>{Array.from({ length: SKELETON_ROWS }, (_, row) => <TableRow key={row}>
        {COLUMN_WIDTHS[kind].map((_, column) => <TableCell key={column} className="px-3 py-3">
          <Skeleton className={column === 1 ? "h-10 w-full" : "h-5 w-full"} />
        </TableCell>)}
      </TableRow>)}</TableBody>
    </Table>
  </div></LoadingRegion>
}

export function ListEmpty({ active, reset, message }: { active: boolean; reset: () => void; message: string }) {
  return <div className="flex flex-col items-center gap-4 rounded-xl border px-5 py-12 text-center">
    <p className="text-sm text-muted-foreground">{active ? listText.noMatches : message}</p>
    {active ? <Button variant="outline" onClick={reset}>{listText.reset}</Button> : null}
  </div>
}

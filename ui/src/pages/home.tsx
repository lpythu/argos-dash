import { OverviewSkeleton } from "@/components/page-skeleton"
import { ErrorAlert } from "@/components/error-alert"
import { LiveRunsPanel } from "./overview/live-runs"
import { OverviewSummary } from "./overview/summary"
import { IssuesPanel, RecentRunsPanel } from "./overview/tables"
import { OverviewToolbar } from "./overview/toolbar"
import { useOverview } from "./overview/use-overview"

export function HomePage() {
  const state = useOverview()
  const { overview, recent, error } = state
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <OverviewToolbar state={state} />
      {error ? <ErrorAlert>{error}</ErrorAlert> : null}
      {state.loading ? <OverviewSkeleton /> : overview ? (
        <>
          <OverviewSummary overview={overview} />
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
            <aside className="min-w-0 xl:col-start-2 xl:row-start-1">
              <LiveRunsPanel runs={overview.live} />
            </aside>
            <div className="flex min-w-0 flex-col gap-6 xl:col-start-1 xl:row-start-1">
              <IssuesPanel issues={overview.issues.filter((issue) => issue.open)} />
              <RecentRunsPanel runs={recent} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

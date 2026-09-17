declare module "@argos/report-view" {
  import type { ReactNode } from "react"

  export type ReportPayload = {
    status?: string
    cases?: unknown[]
    passed?: number
    failed?: number
    skipped?: number
    interrupted?: number
    [key: string]: unknown
  }

  export function ReportView(props: {
    report: ReportPayload
    artifactHref?: (path: string) => string
  }): ReactNode
}

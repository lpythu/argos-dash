import { PageSkeleton } from "@/components/page-skeleton"
import { useResource } from "@/hooks/use-resource"
import { ErrorAlert } from "@/components/error-alert"
import { useCallback } from "react"
import { Link, useParams } from "react-router-dom"

import { api } from "@/lib/api"
import { t } from "@/lib/i18n"
import { ReportView, type ReportPayload } from "@/report-view"

export function ReportPage() {
  const { id } = useParams()
  const loader = useCallback(() => api<ReportPayload>(`/api/runs/${id}/report`), [id])
  const { data: report, error, loading } = useResource(loader)
  if (loading) return <div className="space-y-4"><Back id={id} /><PageSkeleton /></div>

  if (error) {
    return (
      <div className="space-y-3">
        <Back id={id} />
        <ErrorAlert>{error}</ErrorAlert>
      </div>
    )
  }
  if (!report) return null

  return (
    <div className="space-y-4">
      <Back id={id} />
      <ReportView
        report={report}
        artifactHref={(path) => `/api/runs/${id}/file?path=${encodeURIComponent(path)}`}
      />
    </div>
  )
}

function Back({ id }: { id?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link className="text-link" to={id ? `/runs/${id}` : "/runs"}>
        {t("backToRun")}
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="font-medium">{t("reportPage")}</span>
    </div>
  )
}

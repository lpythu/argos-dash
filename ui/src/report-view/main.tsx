import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./host/index.css"

import { ReportView } from "./ReportView"
import type { ReportPayload } from "./types"

function boot(): void {
  const dataEl = document.getElementById("argos-report")
  const rootEl = document.getElementById("root")
  if (!dataEl || !rootEl) return
  let report: ReportPayload = {}
  try {
    report = JSON.parse(dataEl.textContent || "{}") as ReportPayload
  } catch {
    report = { status: "fail", cases: [], passed: 0, failed: 1, skipped: 0, interrupted: 0 }
  }
  createRoot(rootEl).render(
    <StrictMode>
      <div className="w-full min-w-0 px-9 py-4 md:py-6">
        <ReportView report={report} />
      </div>
    </StrictMode>,
  )
}

boot()

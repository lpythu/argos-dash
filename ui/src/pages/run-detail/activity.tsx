import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { type Comment, type EventRow } from "@/lib/api"
import { fmtWhen } from "@/lib/fmt"
import { t } from "@/lib/i18n"
import { type Dispatch, type FormEvent, type SetStateAction } from "react"

export function formatEvent(row: EventRow): string {
  const parts = [
    row.ended_at || row.started_at || row.at || "",
    row.iteration ? `#${row.iteration}` : "",
    row.type || "",
    row.id || "",
    row.message || row.name || "",
    row.status || "",
    row.detail || "",
  ]
  return parts.map((item) => String(item)).filter(Boolean).join("  ")
}

export function renderEvents({ events, eventTotal }: { events: EventRow[]; eventTotal: number }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <CardTitle>{t("events")}</CardTitle>
      <span className="text-xs text-muted-foreground">
        {events.length} / {eventTotal}
      </span>
    </div>
    <pre className="max-h-64 overflow-auto text-xs text-muted-foreground">
      {events.map(formatEvent).join("\n")}
    </pre>
  </CardContent></Card>
}

export function renderComments({ comments, onComment, body, setBody }: { comments: Comment[]; onComment: (event: FormEvent) => Promise<void>; body: string; setBody: Dispatch<SetStateAction<string>> }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
    <CardTitle>{t("comments")}</CardTitle>
    {comments.length ? (
      <ul className="space-y-2">
        {comments.map((row) => (
          <li key={row.id} className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">
              {row.author.name || row.author.login} · {fmtWhen(row.created_at)}
              {row.case_id ? ` · ${row.case_id}` : ""}
            </div>
            <p className="mt-1 whitespace-pre-wrap">{row.body}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">{t("emptyComments")}</p>
    )}
    <form className="space-y-2" onSubmit={(e) => void onComment(e)}>
      <Textarea aria-label={t("commentPlaceholder")} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("commentPlaceholder")} />
      <Button type="submit">{t("addComment")}</Button>
    </form>
  </CardContent></Card>
}

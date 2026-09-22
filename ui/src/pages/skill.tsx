import { ErrorAlert } from "@/components/error-alert"
import { PageSkeleton } from "@/components/page-skeleton"
import { useResource } from "@/hooks/use-resource"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"

export function SkillPage() {
  const { data: text, loading, error } = useResource(loadSkill)
  const [copied, setCopied] = useState("")
  const install = `Install ${window.location.origin}/skill.md`

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading || !!error} onClick={() => void copy(text || "", t("copySkill"))}>{t("copySkill")}</Button>
        <Button variant="outline" onClick={() => void copy(install, t("copyInstall"))}>
          {t("copyInstall")}
        </Button>
        {copied ? <span className="self-center text-sm text-muted-foreground">{t("copied")}</span> : null}
      </div>
      {error ? <ErrorAlert>{error}</ErrorAlert> : null}
      {loading ? <PageSkeleton layout="document" /> : <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3">
        <CardTitle>{t("skill")}</CardTitle>
        <p className="max-w-3xl font-mono text-sm wrap-anywhere">{install}</p>
        <div className="prose prose-sm max-w-3xl wrap-anywhere dark:prose-invert [&_pre]:overflow-x-auto">
          <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
        </div>
      </CardContent></Card>}
    </div>
  )
}

async function loadSkill() {
  const response = await fetch("/skill.md")
  if (!response.ok) throw new Error(`Skill 加载失败 (${response.status})`)
  return response.text()
}

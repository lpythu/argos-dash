import { useMemo } from "react"
import { CopyAction } from "@/components/copy-action"
import { ErrorAlert } from "@/components/error-alert"
import { useResource } from "@/hooks/use-resource"
import { t } from "@/lib/i18n"
import { SkillDocument } from "./skill/document"
import { parseHeadings } from "./skill/headings"
import { SKILL_GRID, skillText } from "./skill/shared"
import { SkillSidebar } from "./skill/sidebar"
import { SkillSkeleton } from "./skill/skeleton"

export function SkillPage() {
  const { data: text, loading, error } = useResource(loadSkill)
  const outline = useMemo(() => parseHeadings(text || ""), [text])
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1"><h1 className="text-lg font-medium">{t("skill")}</h1>
        <p className="text-sm text-muted-foreground">{skillText.intro}</p></div>
      <div className="flex flex-wrap gap-2"><CopyAction value={text || ""} label={t("copySkill")} disabled={loading || !!error} /></div>
    </div>
    {error ? <ErrorAlert>{error}</ErrorAlert> : null}
    {loading ? <SkillSkeleton /> : <div className={SKILL_GRID}>
      <SkillSidebar sections={outline.sections} />
      {text !== null ? <SkillDocument text={text} headings={outline.headings} /> : null}
    </div>}
  </div>
}

async function loadSkill() {
  const response = await fetch("/skill.md")
  if (!response.ok) throw new Error(`Skill 加载失败 (${response.status})`)
  return response.text()
}

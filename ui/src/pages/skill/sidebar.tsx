import { Link } from "react-router-dom"
import { CopyAction } from "@/components/copy-action"
import { Disclosure } from "@/components/disclosure"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"
import type { Heading } from "./headings"
import { SKILL_CARD, skillText } from "./shared"

export function SkillSidebar({ sections }: { sections: readonly Heading[] }) {
  const install = `Install ${window.location.origin}/skill.md`
  return <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
    <Card className={SKILL_CARD}><CardContent className="space-y-4 p-5">
      <CardTitle><h2>{skillText.install}</h2></CardTitle>
      <p className="text-sm leading-relaxed text-muted-foreground">{skillText.installHint}</p>
      <pre className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed wrap-anywhere">{install}</pre>
      <div className="flex flex-wrap gap-2"><CopyAction value={install} label={t("copyInstall")} /></div>
      <Link className={buttonVariants({ variant: "link", className: "h-auto whitespace-normal px-0" })} to="/cli">{skillText.cli}</Link>
    </CardContent></Card>
    {sections.length ? <Card className={SKILL_CARD}><CardContent className="p-5">
      <div className="lg:hidden"><Disclosure title={skillText.contents}><Contents sections={sections} /></Disclosure></div>
      <div className="hidden space-y-4 lg:block"><CardTitle><h2>{skillText.contents}</h2></CardTitle><Contents sections={sections} /></div>
    </CardContent></Card> : null}
  </aside>
}

function Contents({ sections }: { sections: readonly Heading[] }) {
  return <nav aria-label={skillText.contents} className="max-h-[40svh] overflow-y-auto py-2">
    <ul className="space-y-1">
      {sections.map((section) => <li key={section.id}>
        <a href={`#${encodeURIComponent(section.id)}`} className={`block rounded-md py-2 text-sm leading-snug text-muted-foreground wrap-anywhere hover:bg-muted hover:text-foreground ${section.depth === 3 ? "pl-5 pr-2" : "px-2"}`}>
          {section.title}
        </a>
      </li>)}
    </ul>
  </nav>
}

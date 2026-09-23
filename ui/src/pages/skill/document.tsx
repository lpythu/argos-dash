import { useMemo } from "react"
import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Heading } from "./headings"
import { SKILL_CARD, skillText } from "./shared"
import "./document.css"

export function SkillDocument({ text, headings }: { text: string; headings: readonly Heading[] }) {
  const components = useMemo(() => markdownComponents(headings), [headings])
  return <Card className={`${SKILL_CARD} lg:col-start-1 lg:row-start-1`}>
    <CardContent className="p-5">
      <article className="skill-document" aria-label={skillText.document}>
        <Markdown remarkPlugins={[remarkGfm]} components={components}>{text}</Markdown>
      </article>
    </CardContent>
  </Card>
}

function markdownComponents(headings: readonly Heading[]): Components {
  const ids = new Map(headings.map((heading) => [heading.offset, heading.id]))
  const anchors = new Map(headings.map((heading) => [`#${heading.slug}`, `#${heading.id}`]))
  return {
    h1: ({ node, ...props }) => <h1 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    h2: ({ node, ...props }) => <h2 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    h3: ({ node, ...props }) => <h3 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    h4: ({ node, ...props }) => <h4 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    h5: ({ node, ...props }) => <h5 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    h6: ({ node, ...props }) => <h6 {...props} id={ids.get(node?.position?.start.offset ?? -1)} tabIndex={-1} />,
    a: ({ node: _node, href, ...props }) => <a {...props} href={anchors.get(href || "") || href} />,
    table: ({ node: _node, ...props }) => <Table {...props} />,
    thead: ({ node: _node, ...props }) => <TableHeader {...props} />,
    tbody: ({ node: _node, ...props }) => <TableBody {...props} />,
    tr: ({ node: _node, ...props }) => <TableRow {...props} />,
    th: ({ node: _node, ...props }) => <TableHead {...props} />,
    td: ({ node: _node, ...props }) => <TableCell {...props} />,
  }
}

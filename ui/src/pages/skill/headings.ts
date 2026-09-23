import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"

type MarkdownNode = {
  readonly type: string; readonly value?: string; readonly alt?: string | null; readonly depth?: number
  readonly children?: readonly MarkdownNode[]; readonly position?: { readonly start: { readonly offset?: number } }
}
export type Heading = Readonly<{ id: string; slug: string; title: string; depth: number; offset: number }>
const SECTION_DEPTHS = [2, 3]
const parser = unified().use(remarkParse).use(remarkGfm)

function headingText(node: MarkdownNode): string {
  if (node.type === "text" || node.type === "inlineCode") return node.value || ""
  if (node.type === "image") return node.alt || ""
  return (node.children || []).map(headingText).join("")
}

function headingNodes(node: MarkdownNode): readonly MarkdownNode[] {
  if (node.type === "heading") return [node]
  return (node.children || []).flatMap(headingNodes)
}

export function parseHeadings(markdown: string) {
  const used = new Set<string>()
  const headings: Heading[] = headingNodes(parser.parse(markdown)).map((node) => {
    const title = headingText(node).trim()
    const base = title.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s+/g, "-") || "section"
    let slug = base
    let duplicate = 0
    while (used.has(slug)) { duplicate += 1; slug = `${base}-${duplicate}` }
    used.add(slug)
    return { title, slug, id: `skill-${slug}`, depth: node.depth!, offset: node.position!.start.offset! }
  })
  return { headings, sections: headings.filter((heading) => SECTION_DEPTHS.includes(heading.depth)) }
}

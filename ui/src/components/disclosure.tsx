import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"

type DisclosureProps = Readonly<{
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  id?: string
  className?: string
  triggerClassName?: string
}>

export function Disclosure({ title, children, defaultOpen, id, className, triggerClassName }: DisclosureProps) {
  return (
    <Collapsible id={id} defaultOpen={defaultOpen} className={className}>
      <CollapsibleTrigger render={<Button variant="ghost" />}
        className={cn("group h-auto w-full justify-start whitespace-normal text-left", triggerClassName)}>
        <ChevronDownIcon className="size-4 shrink-0 -rotate-90 transition-transform group-data-panel-open:rotate-0" />
        <span className="min-w-0 wrap-anywhere">{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

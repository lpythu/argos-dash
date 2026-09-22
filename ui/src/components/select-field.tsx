import { cn } from "@/lib/utils"
import {
  Select,SelectContent,SelectGroup,SelectItem,SelectTrigger,SelectValue,
} from "@/components/ui/select";

type SelectOption = Readonly<{ value: string; label: string }>
type SelectFieldProps = Readonly<{
  value: string
  items: readonly SelectOption[]
  onValueChange: (value: string) => void
  label: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
}>

export function SelectField({ value, items, onValueChange, label, id, name, disabled, className }: SelectFieldProps) {
  return (
    <Select items={items} value={value} name={name} disabled={disabled}
      onValueChange={(next) => { if (next !== null) onValueChange(next) }}>
      <SelectTrigger id={id} aria-label={label} className={cn("max-w-full min-w-0", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

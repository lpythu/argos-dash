import { Alert, AlertDescription } from "@/components/ui/alert"
import { CircleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

export function ErrorAlert({ children }: { readonly children: ReactNode }) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertDescription className="wrap-anywhere">{children}</AlertDescription>
    </Alert>
  )
}

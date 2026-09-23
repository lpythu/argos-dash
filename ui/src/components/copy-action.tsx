import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/fmt"
import { t } from "@/lib/i18n"

const COPY_FEEDBACK_MS = 1500

type CopyProps = { value: string; label: string; accessibleLabel?: string; disabled?: boolean }

export function CopyAction({ value, label, accessibleLabel = label, disabled = false }: CopyProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const copied = copiedValue === value
  useEffect(() => {
    if (copiedValue === null) return
    const timer = window.setTimeout(() => setCopiedValue(null), COPY_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [copiedValue])
  async function copy() {
    setPending(true)
    setError("")
    setCopiedValue(null)
    try {
      await copyText(value)
      setCopiedValue(value)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setPending(false)
    }
  }
  return <>
    <Button variant="outline" disabled={disabled || pending} aria-label={copied ? `${t("copied")}: ${accessibleLabel}` : accessibleLabel}
      onClick={() => void copy()}>{copied ? t("copied") : label}</Button>
    <span className="sr-only" aria-live="polite">{copied ? `${t("copied")}: ${accessibleLabel}` : ""}</span>
    {error ? <p role="alert" className="w-full text-sm text-destructive wrap-anywhere">{error}</p> : null}
  </>
}

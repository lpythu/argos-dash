import { LoadingRegion } from "@/components/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { useResource } from "@/hooks/use-resource"
import { ErrorAlert } from "@/components/error-alert"
import { Label } from "@/components/ui/label"
import { type FormEvent, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { ArgosMark } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { t } from "@/lib/i18n"

type Provider = { id: string; name: string }

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(params.get("error") === "sso" ? t("ssoError") : "")
  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    try {
      await api("/api/login", { method: "POST", body: JSON.stringify({ login, password }) })
      navigate("/")
    } catch {
      setError(t("loginError"))
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <Card className="min-w-0 gap-0 py-0 w-full max-w-sm"><CardContent className="p-4 space-y-4">
        <CardTitle className="flex items-center gap-2">
          <ArgosMark className="size-6 text-foreground" />
          {t("brand")}
        </CardTitle>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Label className="block space-y-1 text-sm">
            <span>{t("username")}</span>
            <Input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
          </Label>
          <Label className="block space-y-1 text-sm">
            <span>{t("password")}</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Label>
          {error ? <ErrorAlert>{error}</ErrorAlert> : null}
          <Button type="submit" className="w-full">
            {t("login")}
          </Button>
        </form>
        <ProviderActions />
      </CardContent></Card>
    </div>
  )
}

function renderActions({ providers }: { providers: Provider[] }): import("react").ReactNode {
  return <div className="space-y-2">
    {providers.map((item) => (
      <Button
        key={item.id}
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = `/api/auth/sso/${item.id}`
        } }
      >
        {t("loginWith", { name: item.name })}
      </Button>
    ))}
  </div>
}

function loadProviders() {
  return api<{ providers: Provider[] }>("/api/auth/sso")
}

function ProviderActions() {
  const { data, loading, error } = useResource(loadProviders)
  if (loading) return <LoadingRegion><Skeleton className="h-9 w-full" /></LoadingRegion>
  if (error) return <ErrorAlert>{error}</ErrorAlert>
  return renderActions({ providers: data?.providers || [] })
}

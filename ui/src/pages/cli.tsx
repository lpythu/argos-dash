import { PageSkeleton } from "@/components/page-skeleton"
import { useResource } from "@/hooks/use-resource"
import { useCallback, useState, type Dispatch, type SetStateAction } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { t } from "@/lib/i18n"

type CliConfig = {
  url: string
  token: string
  env: string
  library_skill: string
}

export function CliPage() {
  const loader = useCallback(() => api<CliConfig>("/api/cli-config"), [])
  const { data: cfg, error, loading } = useResource(loader)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState("")

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(""), 1500)
  }

  function download() {
    window.location.href = "/api/cli-config/dash.env"
  }

  const installLib = cfg ? `Install ${cfg.library_skill}` : ""
  const runExample = "argos run <id> --dash ./dash.env"

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium">{t("cli")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("cliHint")}</p>
      </div>
      {error ? (
        <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-2 wrap-anywhere [&>*]:max-w-3xl">
          <CardTitle>{t("cliTokenMissing")}</CardTitle>
          <p className="text-sm text-muted-foreground font-mono">{error}</p>
        </CardContent></Card>
      ) : null}
      {loading ? <PageSkeleton layout="config" /> : null}
      {cfg ? (
        renderCliOrigin({ cfg, copy, revealed, setRevealed, download, runExample, installLib })
      ) : null}
      {copied ? <span className="text-sm text-muted-foreground">{t("copied")}: {copied}</span> : null}
    </div>
  )
}

function renderCliOrigin({ cfg, copy, revealed, setRevealed, download, runExample, installLib }: { cfg: CliConfig; copy: (value: string, label: string) => Promise<void>; revealed: boolean; setRevealed: Dispatch<SetStateAction<boolean>>; download: () => void; runExample: string; installLib: string }): import("react").ReactNode {
  return <>
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3 wrap-anywhere [&>*]:max-w-3xl">
      <CardTitle>{t("cliOrigin")}</CardTitle>
      <div className="flex flex-wrap gap-2">
        <Input className="font-mono text-sm" aria-label={t("cliOrigin")} readOnly value={cfg.url} />
        <Button variant="outline" onClick={() => void copy(cfg.url, t("cliOrigin"))}>
          {t("copy")}
        </Button>
      </div>
    </CardContent></Card>
    {renderCliToken({ revealed, cfg, setRevealed, copy })}
    {renderCliDownload({ cfg, download, copy, runExample })}
    <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3 wrap-anywhere [&>*]:max-w-3xl">
      <CardTitle>{t("cliLibrary")}</CardTitle>
      <p className="text-sm text-muted-foreground">{t("cliLibraryHint")}</p>
      <p className="font-mono text-sm">{installLib}</p>
      <Button variant="outline" onClick={() => void copy(installLib, t("cliLibrary"))}>
        {t("copyInstall")}
      </Button>
    </CardContent></Card>
  </>
}

function renderCliDownload({ cfg, download, copy, runExample }: { cfg: CliConfig; download: () => void; copy: (value: string, label: string) => Promise<void>; runExample: string }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3 wrap-anywhere [&>*]:max-w-3xl">
    <CardTitle>{t("cliDownload")}</CardTitle>
    <p className="text-sm text-muted-foreground">{t("cliDownloadHint")}</p>
    <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs">{cfg.env}</pre>
    <div className="flex flex-wrap gap-2">
      <Button onClick={download}>{t("cliDownload")}</Button>
      <Button variant="outline" onClick={() => void copy(cfg.env, t("cliDownload"))}>
        {t("copyEnv")}
      </Button>
      <Button variant="outline" onClick={() => void copy(runExample, t("cliRunExample"))}>
        {t("copyCmd")}
      </Button>
    </div>
    <p className="font-mono text-sm">{runExample}</p>
  </CardContent></Card>
}

function renderCliToken({ revealed, cfg, setRevealed, copy }: { revealed: boolean; cfg: CliConfig; setRevealed: Dispatch<SetStateAction<boolean>>; copy: (value: string, label: string) => Promise<void> }) {
  return <Card className="min-w-0 gap-0 py-0"><CardContent className="p-4 space-y-3 wrap-anywhere [&>*]:max-w-3xl">
    <CardTitle>{t("cliToken")}</CardTitle>
    <div className="flex flex-wrap gap-2">
      <Input
        className="font-mono text-sm"
        readOnly
        aria-label={t("cliToken")} type={revealed ? "text" : "password"}
        value={cfg.token} />
      <Button variant="outline" onClick={() => setRevealed((v) => !v)}>
        {revealed ? t("cliHide") : t("cliReveal")}
      </Button>
      <Button variant="outline" onClick={() => void copy(cfg.token, t("cliToken"))}>
        {t("copy")}
      </Button>
    </div>
  </CardContent></Card>
}

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from "@/lib/i18n"
import { CopyAction } from "@/components/copy-action"
import { CLI_CARD, CLI_CODE, CLI_CONTENT, cliText, type CliConfig } from "./shared"

export function ConnectionPanels({ config }: { config: CliConfig }) {
  const install = `Install ${config.library_skill}`
  return <aside className="min-w-0 space-y-6">
    <Card className={CLI_CARD}><CardContent className={CLI_CONTENT}>
      <CardTitle><h2>{cliText.connection}</h2></CardTitle>
      <div className="space-y-2">
        <Label htmlFor="cli-origin">{t("cliOrigin")}</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input id="cli-origin" className="min-w-0 flex-1 basis-32 font-mono text-sm" readOnly value={config.url} />
          <CopyAction value={config.url} label={t("copy")} accessibleLabel={cliText.copyUrl} />
        </div>
      </div>
      <TokenField token={config.token} />
    </CardContent></Card>
    <Card className={CLI_CARD}><CardContent className={CLI_CONTENT}>
      <CardTitle><h2>{t("cliLibrary")}</h2></CardTitle>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("cliLibraryHint")}</p>
      <pre className={CLI_CODE}>{install}</pre>
      <div className="flex flex-wrap gap-2"><CopyAction value={install} label={t("copyInstall")} /></div>
    </CardContent></Card>
  </aside>
}

function TokenField({ token }: { token: string }) {
  const [revealed, setRevealed] = useState(false)
  return <div className="space-y-2 border-t pt-4">
    <Label htmlFor="cli-token">{t("cliToken")}</Label>
    <div className="flex flex-wrap items-center gap-2">
      <Input id="cli-token" className="min-w-0 flex-1 basis-28 font-mono text-sm" readOnly
        type={revealed ? "text" : "password"} value={token} />
      <Button variant="ghost" aria-controls="cli-token" aria-pressed={revealed} onClick={() => setRevealed((value) => !value)}>
        {revealed ? t("cliHide") : t("cliReveal")}
      </Button>
      <CopyAction value={token} label={t("copy")} accessibleLabel={cliText.copyToken} />
    </div>
  </div>
}

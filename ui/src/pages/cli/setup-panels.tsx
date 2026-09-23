import { Link } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"
import { CopyAction } from "@/components/copy-action"
import { CLI_CARD, CLI_CODE, CLI_CONTENT, CONFIG_DOWNLOAD, RUN_EXAMPLE, cliText, type CliConfig } from "./shared"

export function SetupPanels({ config }: { config: CliConfig }) {
  return <div className="min-w-0 space-y-6">
    <Card className={CLI_CARD}><CardContent className={CLI_CONTENT}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle><h2>{cliText.download}</h2></CardTitle>
        <a className={buttonVariants()} href={CONFIG_DOWNLOAD} download="dash.env">{t("cliDownload")}</a>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("cliDownloadHint")}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-sm">dash.env</span>
        <CopyAction value={config.env} label={t("copyEnv")} />
      </div>
      <pre className={CLI_CODE} aria-label="dash.env">{config.env}</pre>
    </CardContent></Card>
    <Card className={CLI_CARD}><CardContent className={CLI_CONTENT}>
      <CardTitle><h2>{cliText.run}</h2></CardTitle>
      <p className="text-sm leading-relaxed text-muted-foreground">{cliText.runHint}</p>
      <pre className={CLI_CODE} aria-label={t("cliRunExample")}>{RUN_EXAMPLE}</pre>
      <div className="flex flex-wrap items-center gap-3">
        <CopyAction value={RUN_EXAMPLE} label={t("copyCmd")} />
        <Link className={buttonVariants({ variant: "ghost" })} to="/plan">{cliText.plan}</Link>
      </div>
    </CardContent></Card>
  </div>
}

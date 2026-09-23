import { ErrorAlert } from "@/components/error-alert"
import { useResource } from "@/hooks/use-resource"
import { api } from "@/lib/api"
import { t } from "@/lib/i18n"
import { ConnectionPanels } from "./cli/connection-panels"
import { SetupPanels } from "./cli/setup-panels"
import { CLI_GRID, type CliConfig } from "./cli/shared"
import { CliSkeleton } from "./cli/skeleton"

function loadConfig() {
  return api<CliConfig>("/api/cli-config")
}

export function CliPage() {
  const { data: config, error, loading } = useResource(loadConfig)
  return <div className="space-y-6">
    <div className="space-y-1">
      <h1 className="text-lg font-medium">{t("cli")}</h1>
      <p className="text-sm text-muted-foreground">{t("cliHint")}</p>
    </div>
    {error ? <ErrorAlert>{error}</ErrorAlert> : null}
    {loading ? <CliSkeleton /> : config ? <div className={CLI_GRID}>
      <SetupPanels config={config} />
      <ConnectionPanels config={config} />
    </div> : null}
  </div>
}

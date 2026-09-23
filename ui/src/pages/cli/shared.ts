export type CliConfig = Readonly<{ url: string; token: string; env: string; library_skill: string }>
export const CLI_GRID = "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]"
export const CLI_CARD = "min-w-0 gap-0 py-0"
export const CLI_CONTENT = "space-y-4 p-5"
export const CLI_CODE = "overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed wrap-anywhere"
export const RUN_EXAMPLE = "argos run <id> --dash ./dash.env"
export const CONFIG_DOWNLOAD = "/api/cli-config/dash.env"
const zh = {
  download: "1. 下载配置", run: "2. 在本机运行", connection: "连接信息",
  runHint: "将 dash.env 放到工作目录，替换 <id> 为已安装 pack 中的用例 ID 后执行。",
  plan: "去规划页选择用例", copyUrl: "复制实例 URL", copyToken: "复制 Token",
}
const en: typeof zh = {
  download: "1. Download configuration", run: "2. Run locally", connection: "Connection details",
  runHint: "Place dash.env in your working directory, replace <id> with a case ID from an installed pack, then run the command.",
  plan: "Choose cases in Plan", copyUrl: "Copy instance URL", copyToken: "Copy token",
}
export const cliText = navigator.language.toLowerCase().startsWith("zh") ? zh : en

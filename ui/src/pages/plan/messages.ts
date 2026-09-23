const zh = {
  intro: "选择用例、确认清单并配置运行参数，在本机执行生成的命令。",
  search: "搜索用例名称或 ID", allPacks: "全部 Pack", noMatch: "没有匹配的用例",
  config: "运行配置", command: "命令预览", remove: "移除", clearAll: "清空全部",
  selection: "已选用例", once: "单次运行", soak: "持续运行", failFast: "失败时停止",
  summary: "计划摘要", missing: "当前用例库未返回此用例的信息", checks: "规划提示",
}
const en: typeof zh = {
  intro: "Choose cases, review your selection, and configure a command to run locally.",
  search: "Search case name or ID", allPacks: "All packs", noMatch: "No matching cases",
  config: "Run configuration", command: "Command preview", remove: "Remove", clearAll: "Clear all",
  selection: "Selected cases", once: "Run once", soak: "Continuous run", failFast: "Stop on failure",
  summary: "Plan summary", missing: "This case is not in the current catalog", checks: "Planning notes",
}
export const planText = navigator.language.toLowerCase().startsWith("zh") ? zh : en

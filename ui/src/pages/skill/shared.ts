export const SKILL_GRID = "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]"
export const SKILL_CARD = "min-w-0 gap-0 py-0"
const zh = {
  intro: "安装当前 Dash 实例的 Skill，了解连接 CLI 与运行用例的方式。",
  install: "当前实例 Skill", installHint: "复制此安装指令，供支持 Skill 的工具使用。",
  contents: "本文目录", cli: "打开 CLI 接入配置", document: "Skill 文档",
}
const en: typeof zh = {
  intro: "Install this Dash instance’s Skill and learn how to connect the CLI and run cases.",
  install: "Instance Skill", installHint: "Copy this install instruction for a tool that supports Skills.",
  contents: "On this page", cli: "Open CLI setup", document: "Skill document",
}
export const skillText = navigator.language.toLowerCase().startsWith("zh") ? zh : en

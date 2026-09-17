import type { PromptIconManifestItem } from "./IconManifest.types";

const legacy = (file: string) => `../../../../assets/icons/figma-combination/${file}`;

const definitions = [
  ["fixed", "prompt.skill.service.color", "SkillServiceIcon", "Skill 服务", "icon-Skill服务", ["Skill 服务", "Skill 服务卡", "股票分析 Skill", "skill service"], "suggestion", ["#BAC4DD", "#EAEEFA", "#FFFFFF", "#77829C", "#3366FF", "#FFC94D", "#DFE8FD", "#DCE1EE", "#00326C", "#000000"], undefined, "provided:Group 2036084050.svg", "source/prompt/011--provided-skill-service.svg"],
  ["fixed", "prompt.inf.logo.color", "InfLogoColorIcon", "INF Logo", "icon-INF Logo", ["INF", "INF Logo", "inf logo"], "suggestion", ["#585BFF", "#1CDEEA", "#1CDCEA", "#5859FE", "#5560FD", "#4D72FA", "#3F8FF6", "#2DB6F0"], undefined, "provided:INFlogo.svg", "source/prompt/012--provided-inf-logo.svg"],
  ["fixed", "prompt.model.custom-deployment.color", "CustomDeploymentColorIcon", "自定义部署", "icon-自定义部署", ["自定义部署", "私有部署", "custom deployment"], "model", ["#EDEDF1", "#FFFFFF", "#122AFF", "#A07CFF"], undefined, "12449:128878", legacy("qz-icon-custom-deployment-color.svg")],
  ["fixed", "prompt.model.llm.color", "LargeLanguageModelColorIcon", "LLM大模型", "icon-LLM大模型", ["大模型", "语言模型", "LLM"], "model", ["#EDEDF1", "#FFFFFF", "#357FFB", "#CEE0FD"], undefined, "12449:128954", legacy("qz-icon-llm-color.svg")],
  ["fixed", "prompt.model.other.color", "OtherModelColorIcon", "其他模型", "icon-其他模型", ["其他模型", "模型类型", "other model"], "model", ["#FFFFFF", "#818CFF", "#A17BFF"], undefined, "12449:128883", "source/prompt/003--cleaned-prompt--12449-128883.svg"],
  ["fixed", "prompt.model.select.color", "SelectModelColorIcon", "选择模型", "icon-选择模型", ["选择模型", "模型选择", "select model"], "model", ["#EDEDF1", "#FFFFFF", "#3366FF"], undefined, "12449:128977", "source/prompt/004--cleaned-prompt--12449-128977.svg"],
  ["fixed", "prompt.status.success.fixed", "StatusSuccessIcon", "状态-完成", "icon-状态-完成", ["完成状态", "成功状态", "success status"], "status", ["#52C41A"], "success", "0:5299", "source/prompt/001--legacy-prompt--0-5299.svg"],
  ["fixed", "prompt.status.failure.fixed", "StatusFailureIcon", "状态-失败", "icon-状态-失败", ["失败状态", "错误状态", "failure status"], "status", ["#F5222D"], "failure", "0:5303", "source/prompt/002--legacy-prompt--0-5303.svg"],
  ["fixed", "prompt.status.in-progress.color", "StatusInProgressIcon", "状态-进行中", "icon-状态-进行中", ["进行中", "处理中", "in progress"], "status", ["#EDF1F7", "#3366FF"], "inProgress", "0:5307", legacy("qz-icon-0-5307.svg")],
  ["current", "prompt.status.not-started.outline", "StatusNotStartedIcon", "状态-未开始", "icon-状态-未开始", ["未开始", "等待开始", "not started"], "status", "outline", "notStarted", "0:5313", "source/prompt/008--cleaned-prompt--0-5313.svg"],
  ["fixed", "prompt.status.loading-blue.color", "StatusLoadingBlueIcon", "状态-加载-蓝色", "icon-状态-加载-蓝色", ["蓝色加载", "加载状态", "blue loading"], "status", ["#FFFFFF", "#F5F5F5", "#3366FF"], "loading", "0:5315", legacy("qz-icon-0-5315.svg")],
  ["fixed", "prompt.status.loading-white.color", "StatusLoadingWhiteIcon", "状态-加载-白色", "icon-状态-加载-白色", ["白色加载", "深色背景加载", "white loading"], "status", ["#FFFFFF"], "loading", "721:564", "source/prompt/010--cleaned-prompt--721-564.svg"],
  ["current", "prompt.attitude.like.fill", "AttitudeLikeFilledIcon", "态度-赞同（填充）", "icon-态度-赞同-面性", ["赞同", "点赞", "like filled"], "attitude", "fill", "like", "0:5440", legacy("qz-icon-0-5440.svg")],
  ["current", "prompt.attitude.dislike.fill", "AttitudeDislikeFilledIcon", "态度-反对（填充）", "icon-态度-反对-面性", ["反对", "点踩", "dislike filled"], "attitude", "fill", "dislike", "0:5442", legacy("qz-icon-0-5442.svg")],
  ["current", "prompt.attitude.unavailable.fill", "AttitudeUnavailableFilledIcon", "态度-不可用（填充）", "icon-态度-不可用-面性", ["不可用态度", "无反馈", "unavailable filled"], "attitude", "fill", "unavailable", "0:5444", legacy("qz-icon-0-5444.svg")],
  ["current", "prompt.attitude.like.outline", "AttitudeLikeIcon", "态度-赞同", "icon-态度-赞同", ["赞同", "点赞", "like"], "attitude", "outline", "like", "0:5434", legacy("qz-icon-0-5434.svg")],
  ["current", "prompt.attitude.dislike.outline", "AttitudeDislikeIcon", "态度-反对", "icon-态度-反对", ["反对", "点踩", "dislike"], "attitude", "outline", "dislike", "0:5436", legacy("qz-icon-0-5436.svg")],
  ["current", "prompt.attitude.unavailable.outline", "AttitudeUnavailableIcon", "态度-不可用", "icon-态度-不可用", ["不可用态度", "无反馈", "unavailable"], "attitude", "outline", "unavailable", "0:5438", legacy("qz-icon-0-5438.svg")],
  ["current", "prompt.alert.fill", "AlertFilledIcon", "提醒（填充）", "icon-提醒-面性", ["提醒", "闹钟", "alert filled"], "alert", "fill", undefined, "336:1098", legacy("qz-icon-336-1098.svg")],
  ["current", "prompt.alert.outline", "AlertIcon", "提醒", "icon-提醒", ["提醒", "闹钟", "alert"], "alert", "outline", undefined, "336:1100", legacy("qz-icon-336-1100.svg")],
  ["current", "prompt.favorite.outline", "FavoriteIcon", "星标", "icon-星标", ["星标", "收藏", "favorite"], "favorite", "outline", undefined, "361:582", legacy("qz-icon-361-582.svg")],
  ["current", "prompt.favorite.fill", "FavoriteFilledIcon", "星标（填充）", "icon-星标-面性", ["星标", "收藏", "favorite filled"], "favorite", "fill", undefined, "361:581", legacy("qz-icon-361-581.svg")],
  ["current", "prompt.information.outline", "PromptInfoIcon", "提示", "icon-提示", ["提示", "信息", "information"], "information", "outline", undefined, "0:5329", legacy("qz-icon-0-5329.svg")],
  ["current", "prompt.information.fill", "PromptInfoFilledIcon", "提示（填充）", "icon-提示-面性", ["提示", "信息", "information filled"], "information", "fill", undefined, "0:5335", legacy("qz-icon-0-5335.svg")],
  ["current", "prompt.favorite.outline.alt", "FavoriteAltIcon", "星标（样式二）", "icon-星标-样式2", ["星标样式二", "收藏样式二", "favorite alt"], "favorite", "outline", undefined, "77:469", legacy("qz-icon-77-469.svg")],
  ["current", "prompt.favorite.fill.alt", "FavoriteAltFilledIcon", "星标（填充，样式二）", "icon-星标-面性-样式2", ["填充星标样式二", "收藏样式二", "favorite filled alt"], "favorite", "fill", undefined, "112:110", legacy("qz-icon-112-110.svg")],
  ["current", "prompt.warning.fill", "WarningFilledIcon", "警告（填充）", "icon-警告-面性", ["警告", "注意", "warning filled"], "warning", "fill", undefined, "0:5454", legacy("qz-icon-0-5454.svg")],
  ["current", "prompt.warning.outline", "WarningIcon", "警告", "icon-警告", ["警告", "注意", "warning"], "warning", "outline", undefined, "0:5456", legacy("qz-icon-0-5456.svg")],
  ["current", "prompt.danger.fill", "DangerFilledIcon", "危险（填充）", "icon-危险-面性", ["危险", "严重", "danger filled"], "danger", "fill", undefined, "0:5570", legacy("qz-icon-0-5570.svg")],
  ["current", "prompt.danger.outline", "DangerIcon", "危险", "icon-危险", ["危险", "严重", "danger"], "danger", "outline", undefined, "0:5572", legacy("qz-icon-0-5572.svg")],
  ["current", "prompt.fire.fill", "FireFilledIcon", "火焰（填充）", "icon-火焰-面性", ["火焰", "热门", "fire filled"], "fire", "fill", undefined, "105:13", legacy("qz-icon-105-13.svg")],
  ["current", "prompt.fire.outline", "FireIcon", "火焰", "icon-火焰", ["火焰", "热门", "fire"], "fire", "outline", undefined, "105:12", legacy("qz-icon-105-12.svg")],
  ["current", "prompt.notification.outline", "NotificationIcon", "通知", "icon-通知", ["通知", "消息", "notification"], "notification", "outline", undefined, "120:12", legacy("qz-icon-120-12.svg")],
  ["current", "prompt.notification.fill", "NotificationFilledIcon", "通知（填充）", "icon-通知-面性", ["通知", "消息", "notification filled"], "notification", "fill", undefined, "120:11", legacy("qz-icon-120-11.svg")],
  ["current", "prompt.selection.cancel.outline", "SelectionCancelIcon", "选择-取消", "icon-选择-取消", ["取消选择", "叉号", "selection cancel"], "selection", "outline", "cancelled", "715:486", legacy("qz-icon-715-486.svg")],
  ["current", "prompt.selection.confirm.outline", "SelectionConfirmIcon", "选择-选中", "icon-选择-选中", ["确认选择", "对号", "selection confirm"], "selection", "outline", "confirmed", "715:485", legacy("qz-icon-715-485.svg")],
  ["current", "prompt.selection.cancel.outline.alt", "SelectionCancelAltIcon", "选择-取消（样式二）", "icon-选择-取消-样式2", ["取消选择样式二", "叉号样式二", "selection cancel alt"], "selection", "outline", "cancelled", "0:5319", legacy("qz-icon-0-5319.svg")],
  ["current", "prompt.help.question.outline", "QuestionIcon", "问号", "icon-问号", ["问号", "帮助", "question"], "help", "outline", undefined, "0:5211", legacy("qz-icon-0-5211.svg")],
  ["current", "prompt.security.outline", "SecurityIcon", "安全", "icon-安全", ["安全", "质检", "security"], "security", "outline", undefined, "0:5265", legacy("qz-icon-0-5265.svg")],
  ["current", "prompt.review.fill", "ReviewIcon", "审查", "icon-审查", ["审查", "检查", "review"], "review", "fill", undefined, "77:567", legacy("qz-icon-77-567.svg")],
  ["current", "prompt.suggestion.fill", "SuggestionIcon", "建议", "icon-建议", ["建议", "灵感", "suggestion"], "suggestion", "fill", undefined, "77:563", legacy("qz-icon-77-563.svg")],
  ["current", "prompt.certification.outline", "CertificationIcon", "认证", "icon-认证", ["认证", "已验证", "certification"], "certification", "outline", undefined, "94:370", legacy("qz-icon-94-370.svg")],
  ["current", "prompt.loading.outline", "PromptLoadingIcon", "加载", "icon-加载", ["加载", "等待", "loading"], "loading", "outline", "loading", "691:808", legacy("qz-icon-691-808.svg")],
  ["current", "prompt.diagnosis.stethoscope.outline", "StethoscopeIcon", "诊断听诊器", "icon-诊断听诊器", ["诊断", "听诊器", "stethoscope"], "diagnosis", "outline", undefined, "732:5", legacy("qz-icon-732-5.svg")],
] as const;

export const promptIconManifest = definitions.map((definition) => {
  const [mode, id, componentName, displayName, legacyName, aliases, family, paint, state, sourceNodeId, sourceFile] = definition;
  const common = { id, componentName, displayName, legacyName, aliases, family, state, sourceNodeId, sourceFile, semantic: "prompt", importPath: "@wangxiaojinger/qizhi-react/icon" } as const;
  return mode === "fixed"
    ? { ...common, style: "color", colorMode: "fixedPalette", fixedColors: paint }
    : { ...common, style: paint, colorMode: "currentColor" };
}) as readonly PromptIconManifestItem[];

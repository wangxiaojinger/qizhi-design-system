import type {
  DetailHeaderProps,
  ServiceDetailHeaderProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Item = ComponentApiItem<Extract<keyof DetailHeaderProps, string>>;
export const detailHeaderApi = [
  { name: "icon", description: "对象身份图形。", type: "ReactNode", defaultValue: "—" },
  { name: "title", description: "详情对象标题。", type: "ReactNode", defaultValue: "—" },
  { name: "status", description: "受控状态文案与语义色。", type: "DetailHeaderStatus", defaultValue: "—" },
  { name: "action", description: "页面级操作。", type: "ReactNode", defaultValue: "—" },
  { name: "properties", description: "关键属性列表。", type: "readonly DetailHeaderProperty[]", defaultValue: "[]" },
  { name: "audit", description: "审计信息区域。", type: "ReactNode", defaultValue: "—" },
  { name: "tabs", description: "详情内容页签。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly Item[];

type ServiceItem = ComponentApiItem<
  Extract<keyof ServiceDetailHeaderProps, string>
>;
export const serviceDetailHeaderApi = [
  { name: "icon", description: "服务图形。", type: "ReactNode", defaultValue: "—" },
  { name: "title", description: "服务详情标题。", type: "ReactNode", defaultValue: "—" },
  { name: "serviceId", description: "服务 ID。", type: "ReactNode", defaultValue: "—" },
  { name: "framework", description: "部署框架和服务方式。", type: "ReactNode", defaultValue: "—" },
  { name: "creator", description: "创建人。", type: "ReactNode", defaultValue: "—" },
  { name: "maintainers", description: "服务维护者。", type: "readonly ServiceDetailHeaderMember[]", defaultValue: "—" },
  { name: "createdAt", description: "创建时间。", type: "ReactNode", defaultValue: "—" },
  { name: "updatedAt", description: "更新时间。", type: "ReactNode", defaultValue: "—" },
  { name: "versions", description: "版本抽屉数据。", type: "readonly ServiceDetailHeaderVersion[]", defaultValue: "—" },
  { name: "tabs", description: "详情页签。", type: "readonly ServiceDetailHeaderTab[]", defaultValue: "—" },
  { name: "defaultOnline", description: "默认服务状态。", type: "boolean", defaultValue: "true" },
  { name: "defaultTab", description: "默认页签。", type: "string", defaultValue: "首项" },
  { name: "defaultVersion", description: "默认部署版本。", type: "string", defaultValue: '"V1"' },
  { name: "headerProps", description: "业务布局、状态、操作和页签；保留公共审计提示与版本抽屉。", type: 'Pick<DetailHeaderProps, "className" | "status" | "action" | "tabs">', defaultValue: "—" },
  { name: "version", description: "受控部署版本。未提供 ID 和框架时，版本入口展示在审计行。", type: "string", defaultValue: "—" },
  { name: "versionLabel", description: "版本入口文案；Skill 使用当前版本。", type: "string", defaultValue: "部署版本" },
  { name: "versionReadOnly", description: "版本抽屉仅供查看，不执行版本切换或回滚。", type: "boolean", defaultValue: "false" },
  { name: "onStatusChange", description: "上下线变化时触发。", type: "(online) => void", defaultValue: "—" },
  { name: "onVersionChange", description: "部署版本变化时触发。", type: "(version) => void", defaultValue: "—" },
  { name: "onTabChange", description: "页签变化时触发。", type: "(key) => void", defaultValue: "—" },
] as const satisfies readonly ServiceItem[];

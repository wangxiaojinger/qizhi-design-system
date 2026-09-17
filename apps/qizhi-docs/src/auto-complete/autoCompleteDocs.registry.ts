import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import CustomOptionDemo from "./demos/CustomOptionDemo";
import customOptionSource from "./demos/CustomOptionDemo.tsx?raw";
import CustomInputDemo from "./demos/CustomInputDemo";
import customInputSource from "./demos/CustomInputDemo.tsx?raw";
import StrictDemo from "./demos/StrictDemo";
import strictSource from "./demos/StrictDemo.tsx?raw";
import ComplexDemo from "./demos/ComplexDemo";
import complexSource from "./demos/ComplexDemo.tsx?raw";
import QueryCertainDemo from "./demos/QueryCertainDemo";
import queryCertainSource from "./demos/QueryCertainDemo.tsx?raw";
import QueryUncertainDemo from "./demos/QueryUncertainDemo";
import queryUncertainSource from "./demos/QueryUncertainDemo.tsx?raw";
import CustomFilterDemo from "./demos/CustomFilterDemo";
import customFilterSource from "./demos/CustomFilterDemo.tsx?raw";

export interface AutoCompleteDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string }

export const autoCompleteDemos: readonly AutoCompleteDemoDefinition[] = [
  { id: "自动补全-基础用法", title: "基础用法", description: "根据当前输入展示输入建议（下拉选择）。", component: BasicDemo, source: basicSource },
  { id: "自动补全-自定义选项", title: "自定义选项", description: "可以传入 AutoComplete.Option 作为组件的 children，而非使用 data。", component: CustomOptionDemo, source: customOptionSource },
  { id: "自动补全-自定义输入组件", title: "自定义输入组件", description: "支持自定义输入组件。", component: CustomInputDemo, source: customInputSource },
  { id: "自动补全-区分大小写", title: "区分大小写", description: "使用 strict=true 来指明在匹配时严格区分大小写。", component: StrictDemo, source: strictSource },
  { id: "自动补全-复杂用法", title: "复杂用法", description: "这个示例展示了：1. 添加 Tooltip，2. 自定义显示，3. 对值进行操控。", component: ComplexDemo, source: complexSource },
  { id: "自动补全-查询模式-确定类目", title: "查询模式 确定类目", description: "根据查询结果补全输入内容（确定类目）。", component: QueryCertainDemo, source: queryCertainSource },
  { id: "自动补全-查询模式-不确定类目", title: "查询模式 不确定类目", description: "根据查询结果补全输入内容（不确定类目）。", component: QueryUncertainDemo, source: queryUncertainSource },
  { id: "自动补全-自定义过滤规则", title: "自定义过滤规则", description: "如果你依赖用户输入来动态更新选项，请通过 filterOption 属性来覆盖默认的选项过滤规则，或者将其设为 false 来关闭默认过滤规则。", component: CustomFilterDemo, source: customFilterSource },
];

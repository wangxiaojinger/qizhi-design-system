import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo"; import basicSource from "./demos/BasicDemo.tsx?raw";
import MorePagesDemo from "./demos/MorePagesDemo"; import morePagesSource from "./demos/MorePagesDemo.tsx?raw";
import PageSizeDemo from "./demos/PageSizeDemo"; import pageSizeSource from "./demos/PageSizeDemo.tsx?raw";
import JumperDemo from "./demos/JumperDemo"; import jumperSource from "./demos/JumperDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo"; import sizeSource from "./demos/SizeDemo.tsx?raw";
import SimpleDemo from "./demos/SimpleDemo"; import simpleSource from "./demos/SimpleDemo.tsx?raw";
import TotalDemo from "./demos/TotalDemo"; import totalSource from "./demos/TotalDemo.tsx?raw";
import ControlledTotalDemo from "./demos/ControlledTotalDemo"; import controlledTotalSource from "./demos/ControlledTotalDemo.tsx?raw";
import CompleteDemo from "./demos/CompleteDemo"; import completeSource from "./demos/CompleteDemo.tsx?raw";

export interface PaginationDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string }
export const paginationDemos: readonly PaginationDemoDefinition[] = [
  { id: "pagination-basic", title: "基础用法", description: "最基础的分页形式，用于在有限页数中前后切换。", component: BasicDemo, source: basicSource },
  { id: "pagination-more", title: "更多页码", description: "页数较多时自动折叠中间页码，并始终保留首页与尾页入口。", component: MorePagesDemo, source: morePagesSource },
  { id: "pagination-page-size", title: "改变每页展示条目", description: "可根据阅读密度或数据规模，切换每页展示的条目数。", component: PageSizeDemo, source: pageSizeSource },
  { id: "pagination-jumper", title: "跳转", description: "输入页码后按 Enter，可快速跳转到指定页。", component: JumperDemo, source: jumperSource },
  { id: "pagination-size", title: "尺寸", description: "分页器提供大、默认、小、迷你四种尺寸，用于适配不同的信息密度。", component: SizeDemo, source: sizeSource },
  { id: "pagination-simple", title: "简洁", description: "空间有限时，可使用“当前页 / 总页数”的精简形式。", component: SimpleDemo, source: simpleSource },
  { id: "pagination-total", title: "展示总数", description: "可展示数据总数，也可根据当前页码展示条目区间。", component: TotalDemo, source: totalSource },
  { id: "pagination-controlled-total", title: "受控的数据总数", description: "无法预先计算数据总数时，到达末页后继续向后翻页，可动态扩展可用数据。", component: ControlledTotalDemo, source: controlledTotalSource },
  { id: "pagination-complete", title: "全部展示", description: "组合展示总数、页码、每页条数和快速跳转，并提供完整禁用状态。", component: CompleteDemo, source: completeSource },
];

# 启智图表：数据项聚焦

## 范围与架构

公共 BarChart（柱状图）和 LineChart（折线图）共用 ChartView（图表视图）与内部 useChartFocus（聚焦钩子）。业务页面只消费启智组件；G2（蚂蚁可视化图表引擎）事件、配置与实例不向外导出。聚焦单位为一个系列的一个数据项：堆叠柱选择单段，不选择整天。跨图表及详情联动归业务层。

鼠标悬停、提示、键盘导航位置、持续选择分别维护。聚焦更新直接调整当前引擎图形的透明度；不重建引擎，不改坐标轴、布局、图例、单位和柱宽。折线连接线及其他点弱化，选中点保留原色；仅开启聚焦时显示半径 3 像素的实心数据点，透明描边扩大命中区域；开启能力时右端增加 3 像素绘制余量以完整显示末端圆点，选择切换不改变此布局。180 毫秒过渡支持中途切换，并在减少动态效果偏好下立即切换。原组件入场动画设置保持不变。

## 公共接口与类型

```ts
export interface FocusedItem {
  readonly seriesKey: string;
  readonly dataIndex: number;
  readonly dataKey?: string;
  readonly data?: ChartDatum;
}
export interface ChartFocusProps {
  focusable?: boolean;
  focusedItem?: FocusedItem | null;
  defaultFocusedItem?: FocusedItem | null;
  onFocusChange?: (item: FocusedItem | null) => void;
  dimOpacity?: number;
  clearFocusOnBackgroundClick?: boolean;
}
```

| 属性 | 语义及默认值 |
| --- | --- |
| focusable（允许聚焦） | 默认 false；不启用点击选择，不影响旧行为 |
| focusedItem（受控聚焦项） | 非 undefined 进入受控；null 明确取消；父级不更新值则视觉不改变 |
| defaultFocusedItem（初始聚焦项） | 非受控初始值，默认 null；挂载后的变更忽略 |
| onFocusChange（变更回调） | 点击、键盘选择／切换／取消及背景清空时通知；非受控数据目标被删除时通知 null；仅受控值更新不重复回调 |
| dimOpacity（弱化透明度） | 默认 0.3；有限值限制在 0～1，非有限值回退 0.3 |
| clearFocusOnBackgroundClick（背景点击清空） | 默认 true；仅绘图区空白，轴、标题、图例不触发清空 |

seriesKey（系列标识）对应 ChartSeries.key；dataKey（分类标识）对应 ChartDatum.x，优先于 dataIndex（分类顺序索引）。dataIndex 从零开始，不是原始扁平数组或页面节点索引。回调始终补齐分类标识、当前索引及原始数据项 data；不会使用事件目标的页面顺序猜测数据。

相同系列与分类再次选择为取消；不同项直接切换。非受控选择会保存稳定标识，重排后追踪同一项；原始数据替换后回调读取当前对象。目标移除或变为缺失后非受控清空；受控无效目标不选中其他项，也不把整图变淡。图例隐藏聚焦系列时暂时停止弱化，重新显示后恢复。缺失值不可选择；零值支持键盘选择，零高度柱不保证鼠标命中。

键盘：左右切换同系列分类、上下切换同分类系列，跳过缺失和隐藏项；Home（起始键）／End（结束键）定位当前系列首尾；未进行键盘导航时默认从已聚焦项进入。Enter（回车）／Space（空格）选择或取消。Escape（退出键）只关闭提示。绘图区采用列表框语义，并为每个可选项提供 aria-selected（选中状态）与当前活动项引用。关闭提示不影响键盘选择。

## 柱状图与非受控示例

```tsx
import { BarChart } from "@wangxiaojinger/qizhi-react";
const series = [{ key: "requests", label: "请求量" }];
const data = [
  { x: "2026-09-01", series: "requests", value: 120 },
  { x: "2026-09-02", series: "requests", value: 180 },
];
export default function Example() {
  return <BarChart label="每日请求量" unit="次" data={data} series={series}
    focusable defaultFocusedItem={null} />;
}
```

## 折线图与非受控示例

```tsx
import { LineChart } from "@wangxiaojinger/qizhi-react";
const series = [{ key: "cost", label: "费用" }];
const data = [
  { x: "2026-09-01", series: "cost", value: 0.36 },
  { x: "2026-09-02", series: "cost", value: 0.54 },
];
export default function Example() {
  return <LineChart label="费用趋势" unit="元" data={data} series={series}
    focusable defaultFocusedItem={{ seriesKey: "cost", dataIndex: 0, dataKey: "2026-09-01" }} />;
}
```

## 受控与业务联动示例

```tsx
import { useState } from "react";
import { BarChart } from "@wangxiaojinger/qizhi-react";
import type { FocusedItem } from "@wangxiaojinger/qizhi-react";
const series = [{ key: "input", label: "输入用量" }, { key: "output", label: "输出用量" }];
const data = [
  { x: "2026-09-01", series: "input", value: 1200 },
  { x: "2026-09-01", series: "output", value: 600 },
  { x: "2026-09-02", series: "input", value: 1600 },
  { x: "2026-09-02", series: "output", value: 800 },
];
export default function Example() {
  const [focusedItem, setFocusedItem] = useState<FocusedItem | null>(null);
  return <>
    <BarChart label="输入与输出用量" unit="词元" data={data} series={series} mode="stacked"
      focusable focusedItem={focusedItem} onFocusChange={setFocusedItem} />
    <p role="status">{focusedItem ? `${focusedItem.dataKey}：${focusedItem.data?.value} 词元` : "尚未选择"}</p>
  </>;
}
```

正式文档保留原有十二个同源示例，所有折线图与柱状图显式启用聚焦；不额外增加聚焦演示。加载、错误状态解除后同样支持选择，空数据没有可选项。公共组件默认仍为关闭。原有标题、说明、数据和顺序保留；展示／复制与实际演示共用 TSX（类型化组件源码），操作区继续复用公共代码按钮。

## 修改文件清单

- `packages/qizhi-react/src/chart/Chart.types.ts`、`packages/qizhi-react/src/index.ts`：公共属性和类型导出。
- `packages/qizhi-react/src/chart/useChartFocus.ts`：共享状态；`chartFocus.ts`：身份映射、有效性和透明度边界。
- `packages/qizhi-react/src/chart/ChartView.tsx`：接入引擎事件、键盘和可访问状态；`chartEngine.ts`：绑定数据命中、背景点击、独立透明度过渡和清理。
- `apps/qizhi-docs/src/chart/chartApi.ts`、`ChartApiTable.tsx`、`chartDocs.registry.ts`、`demos/Focus*.tsx`：接口、四个同源示例；`apps/qizhi-docs/src/api/component-api.json` 为同步生成清单。
- 公共图表聚焦测试、生命周期测试、文档门禁、三档浏览器聚焦测试与验收夹具；旧文档测试同步新增示例数量。

数据模型和样式已有能力足以复用，无需修改 chartModel.ts、chart.css，也没有修改两种图表的薄入口。

## 验证

最终45项专项、三档15项聚焦浏览器检查、类型检查、构建及接口清单校验通过。此前三档21项图表回归通过；截图定位调整后的三档文档再次3项通过。全库最近运行884项通过、6项失败，失败位于本次未修改范围，未宣称全库通过。完整结果及未完成项见[验收记录](../verification/qizhi-chart-focus.md)。实施者验证只记录 candidate_pass（候选通过），独立最终验收保持 pending（待完成）。

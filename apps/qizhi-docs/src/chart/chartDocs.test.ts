import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { queryDemoData } from "./chartDocsRange";

const chartDirectory = resolve(import.meta.dirname);
const readChartSource = (name: string) => {
  const file = resolve(chartDirectory, name);
  expect(existsSync(file), `缺少图表文档源文件：${name}`).toBe(true);
  return readFileSync(file, "utf8");
};

const demoTitles = [
  "折线图：基础折线",
  "折线图：多系列折线",
  "柱状图：普通",
  "柱状图：分组",
  "柱状图：堆叠",
  "费用趋势与单位格式化",
  "图例与提示信息",
  "加载中",
  "空数据",
  "错误状态",
  "零值与缺失数据",
  "响应式与键盘操作",
];

const demoDescriptions = [
  "展示单个指标随时间的变化，并按所选日期范围将无数据日期补为 0。以下为演示数据。",
  "在同一坐标系中对比多个同单位指标的变化，适用于不同服务的请求量对比。以下为演示数据。",
  "使用柱形比较各时间点或分类的数值，适用于每日请求量对比。以下为演示数据。",
  "在同一分类中并排展示多个系列，便于比较输入与输出用量的差异。以下为演示数据。",
  "将多个系列在同一柱形中累加，便于观察用量构成及整体变化。以下为演示数据。",
  "展示费用随时间的变化，并统一格式化坐标轴、提示信息和数据明细。以下为演示数据。",
  "通过图例控制系列显示，并使用提示信息查看同一时间点的数据。以下为演示数据。",
  "数据加载时保留图表区域并显示加载反馈，避免布局跳动。以下为演示状态。",
  "没有可展示的数据时显示空状态，不使用全零曲线代替。",
  "数据获取或图表绘制失败时显示错误反馈，由业务页面决定后续处理。",
  "零值表示已知数值为零，缺失值表示当前没有有效数据，两者使用不同方式展示。以下为演示数据。",
  "图表随容器宽度调整布局，并支持使用键盘查看数据和操作图例。以下为演示数据。",
];

const forbiddenNativeInteractiveTag = /<(button|input|select|textarea|svg)\b/;
const forbiddenPrivateSelector = /\.qizhi-[\w-]+__/;

describe("Chart docs", () => {
  it("建立图表文档入口、12 个同源演示和接口表", () => {
    const island = readChartSource("ChartDocsIsland.tsx");
    const registry = readChartSource("chartDocs.registry.ts");
    const codebox = readChartSource("ChartDemoCodebox.tsx");
    const api = readChartSource("chartApi.ts");
    const apiTable = readChartSource("ChartApiTable.tsx");

    expect(island).toContain("基础组件");
    expect(island).toContain("数据展示");
    expect(island).toContain("图表");
    expect(island).toContain("qizhi:react-island-ready");
    expect(registry).toContain("demos/BasicLineDemo.tsx?raw");
    expect(registry).toContain("demos/ResponsiveKeyboardDemo.tsx?raw");
    expect(codebox).toContain("component-example-actions");
    expect(codebox).toContain("qizhi-code-action");
    expect(codebox).toContain("hidden={!expanded}");
    expect(apiTable).toContain("ApiTable");
    expect(apiTable).toContain(">组件接口<");
    expect(api).toContain("chartCommonApi");
    expect(api).toContain("barChartApi");
    expect(api).toContain("chartDatumApi");
    expect(api).toContain("chartSeriesApi");
  });

  it("保留确认的 12 个示例标题与逐字说明顺序", () => {
    const registry = readChartSource("chartDocs.registry.ts");
    let previousIndex = -1;
    demoTitles.forEach((title, index) => {
      const titleIndex = registry.indexOf(title);
      const descriptionIndex = registry.indexOf(demoDescriptions[index]);
      expect(titleIndex, `缺少标题：${title}`).toBeGreaterThan(previousIndex);
      expect(descriptionIndex, `缺少说明：${title}`).toBeGreaterThan(titleIndex);
      previousIndex = titleIndex;
    });
  });

  it("演示仅消费启智公共组件，源码与预览同源", () => {
    const registry = readChartSource("chartDocs.registry.ts");
    const styles = readChartSource("chartDocs.css");
    const demoNames = [
      "BasicLineDemo",
      "MultiLineDemo",
      "NormalBarDemo",
      "GroupedBarDemo",
      "StackedBarDemo",
      "CostTrendDemo",
      "LegendTooltipDemo",
      "LoadingDemo",
      "EmptyDemo",
      "ErrorDemo",
      "ZeroMissingDemo",
      "ResponsiveKeyboardDemo",
    ];
    demoNames.forEach((name) => {
      const source = readChartSource(`demos/${name}.tsx`);
      expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(registry).toContain(`./demos/${name}.tsx`);
      expect(registry).toContain(`./demos/${name}.tsx?raw`);
      expect(source).not.toMatch(forbiddenNativeInteractiveTag);
      expect(source).not.toContain("style={{");
      expect(source).not.toMatch(forbiddenPrivateSelector);
    });
    expect(styles).not.toMatch(forbiddenPrivateSelector);
  });

  it("原生交互标签和公共组件私有后代选择器会被门禁拦截", () => {
    expect(forbiddenNativeInteractiveTag.test("<button>查看</button>")).toBe(true);
    expect(forbiddenPrivateSelector.test(".qizhi-chart__plot")).toBe(true);
  });

  it("演示保留确认的数据、模式与初始状态", () => {
    const basicLine = readChartSource("demos/BasicLineDemo.tsx");
    const grouped = readChartSource("demos/GroupedBarDemo.tsx");
    const stacked = readChartSource("demos/StackedBarDemo.tsx");
    const loading = readChartSource("demos/LoadingDemo.tsx");
    const empty = readChartSource("demos/EmptyDemo.tsx");
    const error = readChartSource("demos/ErrorDemo.tsx");
    const zeroMissing = readChartSource("demos/ZeroMissingDemo.tsx");

    [120, 180, 150, 210, 280, 260, 300, 290, 320].forEach((value) => {
      expect(basicLine).toContain(`value: ${value}`);
    });
    expect(basicLine).toContain('query(data, { start: "2026-09-01", end: "2026-09-10" })');
    [1200, 1600, 1400, 2000, 1800, 2400, 2200].forEach((value) => {
      expect(grouped).toContain(`value: ${value}`);
      expect(stacked).toContain(`value: ${value}`);
    });
    [600, 800, 700, 1000, 900, 1200, 1100].forEach((value) => {
      expect(grouped).toContain(`value: ${value}`);
      expect(stacked).toContain(`value: ${value}`);
    });
    expect(grouped).toContain('mode="grouped"');
    expect(stacked).toContain('mode="stacked"');
    expect(loading).toContain("useState(true)");
    expect(loading).toContain("loading={loading}");
    expect(empty).toContain("data={[]}");
    expect(error).toContain("数据加载失败，请稍后重试");
    expect(error).toContain("useState(true)");
    expect(zeroMissing).toContain("value: 0");
    expect(zeroMissing).toContain("value: null");
  });

  it("接口表记录公共、柱状图、数据点和系列类型，并给英文标识中文含义", () => {
    const api = readChartSource("chartApi.ts");
    [
      "数据（data）",
      "系列（series）",
      "图表可访问名称（label）",
      "统一单位（unit）",
      "横轴文本格式化（xFormatter）",
      "数值文本格式化（valueFormatter）",
      "显示图例（legend）",
      "显示数据提示（tooltip）",
      "加载状态（loading）",
      "业务错误信息（error）",
      "绘图区高度（height）",
      "根容器类名（className）",
      "根容器标识（id）",
      "根容器引用（ref）",
      "模式（mode）",
      "normal（普通）",
      "grouped（分组）",
      "stacked（堆叠）",
      "分类或时间键（x）",
      "数值（value）",
      "稳定系列键（key）",
      "颜色变量（colorToken）",
    ].forEach((item) => expect(api).toContain(item));
  });
});

it("聚焦接口与公共类型同步登记", () => {
  const api = readChartSource("chartApi.ts");
  const types = readFileSync(resolve(chartDirectory, "../../../../packages/qizhi-react/src/chart/Chart.types.ts"), "utf8");
  for (const name of ["focusable", "focusedItem", "defaultFocusedItem", "onFocusChange", "dimOpacity", "clearFocusOnBackgroundClick"]) {
    expect(api).toContain(`name: "${name}"`); expect(types).toContain(`${name}?:`);
  }
  expect(api).toContain("focusedItemApi");
});

it("所有现有图表示例显式开启聚焦，展示与复制同源", () => {
  let count = 0;
  for (const name of readdirSync(resolve(chartDirectory, "demos")).filter(name => name.endsWith(".tsx"))) {
    const source = readChartSource(`demos/${name}`);
    for (const match of source.matchAll(/<(?:BarChart|LineChart)\b[\s\S]*?\/>/g)) {
      count++;
      expect(match[0], `${name} 未开启图表聚焦`).toMatch(/\bfocusable(?:\s|[/>])/);
    }
  }
  expect(count).toBe(12);
  expect(readChartSource("chartDocs.registry.ts").match(/component:/g)).toHaveLength(13);
});

it("小时数据补零时保留显式未知值和查询的结束边界", () => {
  const start = Date.UTC(2026, 8, 1, 23);
  const end = Date.UTC(2026, 8, 2, 2);
  const query = queryDemoData({ start, end }, "hour", () => {});
  const result = query([{ x: "2026-09-01", series: "requests", value: null }]);
  expect(result.data).toEqual([
    { x: "2026-09-01T23:00:00.000Z", series: "requests", value: null },
    { x: "2026-09-02T00:00:00.000Z", series: "requests", value: 0 },
    { x: "2026-09-02T01:00:00.000Z", series: "requests", value: 0 },
  ]);
  expect(result.rangeSelection).toMatchObject({ timeDomain: { start, end } });
  expect(query([]).data).toEqual([]);
});

it("日查询无匹配记录时返回日桶及零值", () => {
  const query = queryDemoData({ start: Date.UTC(2026, 8, 3), end: Date.UTC(2026, 8, 5) }, "day", () => {});
  const result = query([{ x: "2026-09-01", series: "requests", value: 24 }]);
  expect(result.data.map(row => row.value)).toEqual([0, 0]);
  expect(result.usageTimeAxis?.granularity).toBe("day");
  expect(result.usageTimeAxis?.buckets.map(bucket => bucket.x)).toEqual(["2026-09-03T00:00:00.000Z", "2026-09-04T00:00:00.000Z"]);
});

it("首尾桶按实际查询边界计入模拟事件", () => {
  const start = Date.parse("2026-09-01T07:50:01Z");
  const boundary = Date.parse("2026-09-01T08:00:00Z");
  const end = Date.parse("2026-09-01T08:10:00Z");
  const result = queryDemoData({ start, end }, "hour", () => {})(
    [{ x: "2026-09-01", series: "requests", value: 288 }],
  );
  expect(result.usageTimeAxis?.buckets.map(bucket => [bucket.start, bucket.end])).toEqual([[start, boundary], [boundary, end]]);
  expect(result.data.map(row => row.value)).toEqual([1, 2]);
});

import { LineChart } from "@wangxiaojinger/qizhi-react";

const series = [{ key: "requests", label: "请求量" }];

export default function EmptyDemo() {
  return <LineChart focusable data={[]} series={series} label="空数据请求量趋势图" unit="次" />;
}

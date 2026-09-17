import { Chart } from "@antv/g2";
const host = document.getElementById("probe")!;
const categories = ["一", "二", "三", "四"];
const data = categories.flatMap((x, i) => [{ x, series: "输入", value: [2, 0, 4, -2][i] }, { x, series: "输出", value: [1, 3, 2, -3][i] }]);
async function run() {
  for (const mode of ["line", "multi", "normal", "grouped", "stacked"]) {
    const heading = document.createElement("h2"); heading.textContent = mode; host.append(heading);
    const element = document.createElement("div"); element.dataset.mode = mode; host.append(element);
    const chart = new Chart({ container: element, width: 560, height: 240 });
    chart.options({ type: mode === "line" || mode === "multi" ? "line" : "interval", data: mode === "line" || mode === "normal" ? data.filter(d => d.series === "输入") : data,
      encode: { x: "x", y: "value", color: "series" },
      transform: mode === "stacked" ? [{ type: "stackY" }] : mode === "grouped" ? [{ type: "dodgeX" }] : [],
      scale: { x: { domain: categories }, color: { range: ["#3366ff", "#722ed1"] }, y: { zero: true } },
      animate: false, legend: false, tooltip: false, interaction: { tooltip: false } });
    await chart.render();
    const view = chart.getContext().views![0];
    element.dataset.shapes = String(chart.getContext().canvas!.document.getElementsByClassName("element").length);
    element.dataset.domain = JSON.stringify(view.scale.y.getOptions().domain);
    element.dataset.ready = "true";
  }
}
run().catch(error => { host.dataset.error = String(error); throw error; });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { InputTagDocsIsland } from "./InputTagDocsIsland";
import { inputTagApi } from "./inputTagApi";
import { inputTagDemos } from "./inputTagDocs.registry";

const ids = [
  "标签输入框不同尺寸",
  "获取选项的文本",
  "校验与格式化输入",
  "失焦时保存",
  "最大标签数",
  "响应式显示Tag",
] as const;

const descriptions = [
  "通过设置 size 来指定大小，标签输入框提供 small、default、large 三种尺寸，高度分别为 28px、32px、36px。",
  "可以通过设置 labelInValue=true 获取选项的文本值。",
  "通过 validate 校验输入，也可以返回非布尔类型来将用户输入的字符串格式化为特定值。",
  "设置 saveOnBlur 在失焦时自动将正在输入的文本保存为标签。",
  "通过 maxTagCount 设置最多展示的标签数，maxTagCount.render 自定义 +x 部分的节点内容。",
  "通过 maxTagCount=responsive 设置根据容器尺寸动态显示标签数。标签数较多时不建议使用，可能存在性能问题。",
] as const;

describe("InputTag docs", () => {
  it("keeps all six legacy demos in original order with exact descriptions", () => {
    expect(inputTagDemos.map((demo) => demo.id)).toEqual(ids);
    expect(inputTagDemos.map((demo) => demo.description)).toEqual(descriptions);
  });

  it("publishes runtime TSX and shared scoped CSS from the same registry", () => {
    expect(inputTagDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"')))
      .toBe(true);
    expect(new Set(inputTagDemos.map((demo) => demo.cssSource)).size).toBe(1);
    const css = readFileSync(
      resolve(process.cwd(), "apps/qizhi-docs/src/input-tag/inputTagDemos.css"),
      "utf8",
    );
    expect(css).toContain("#component-input-tag");
  });

  it("reuses public InputTag, Tag behavior, and Radio size controls", () => {
    const source = Object.fromEntries(inputTagDemos.map((demo) => [demo.id, demo.tsxSource]));
    expect(source["标签输入框不同尺寸"]).toContain("<Radio.Group");
    expect(source["标签输入框不同尺寸"]).toContain("<InputTag");
    expect(source["标签输入框不同尺寸"]).not.toContain("qizhi-segmented");
    expect(source["获取选项的文本"]).toContain("labelInValue");
    expect(source["校验与格式化输入"]).toContain("validate=");
    expect(source["失焦时保存"]).toContain("saveOnBlur");
    expect(source["最大标签数"]).toContain("maxTagCount={3}");
    expect(source["响应式显示Tag"]).toContain('maxTagCount="responsive"');
  });

  it("documents the confirmed v1 API", () => {
    expect(inputTagApi.map((item) => item.name)).toEqual([
      "value", "defaultValue", "onChange", "labelInValue", "size", "placeholder",
      "allowClear", "onClear", "validate", "saveOnBlur", "tokenSeparators",
      "maxTagCount", "renderMore", "className", "style", "ref",
    ]);
  });

  it("renders six demos, API, code actions, and the shell-ready event", async () => {
    let ready = 0;
    const handleReady = () => { ready += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);
    render(<InputTagDocsIsland />);
    expect(screen.getByRole("heading", { name: "标签输入框 InputTag" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(6);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "InputTag API" })).toBeInTheDocument();
    await waitFor(() => expect(ready).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });
});

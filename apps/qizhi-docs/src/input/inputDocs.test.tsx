import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { InputDocsIsland } from "./InputDocsIsland";
import { inputApi, inputApiSections } from "./inputApi";
import { inputDemos } from "./inputDocs.registry";

describe("Input docs", () => {
  it("keeps all approved static-site demos in order", () => {
    expect(inputDemos.map((demo) => demo.id)).toEqual([
      "输入框-基本用法",
      "输入框状态",
      "四种尺寸",
      "前置、后置标签",
      "前后缀",
      "搜索框",
      "搜索框-Loading",
      "输入框组合",
      "字数统计",
      "文本域",
      "适应文本高度文本域",
      "密码输入",
      "格式化输入值",
      "宽度自适应",
    ]);
  });

  it("publishes the runtime TSX and shared Demo CSS from the same preview definition", () => {
    expect(inputDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
    const sourceFile = readFileSync(
      resolve(process.cwd(), "apps/qizhi-docs/src/input/inputDemos.css"),
      "utf8",
    );
    expect(sourceFile).toContain("#component-input");
    expect(sourceFile).not.toContain("--qizhi-color-text-3");
    expect(new Set(inputDemos.map((demo) => demo.cssSource)).size).toBe(1);
    expect(inputDemos.every((demo) => Math.max(...demo.tsxSource.split("\n").map((line) => line.length)) <= 100)).toBe(true);
  });

  it("locks the legacy Input demo composition before evolving the component contract", () => {
    const source = Object.fromEntries(inputDemos.map((demo) => [demo.id, demo.tsxSource]));
    expect(source["输入框-基本用法"]).toContain("allowClear");
    expect(source["输入框-基本用法"]).toContain('placeholder="请输入内容"');
    expect(source["输入框-基本用法"]).toContain("style={{ width: 350 }}");
    expect(source["四种尺寸"]).toContain("<Radio.Group");
    expect(source["四种尺寸"]).not.toContain('type="radio"');
    expect(source["四种尺寸"]).toContain("<Slider");
    expect(source["四种尺寸"]).not.toContain('type="range"');
    expect(source["前置、后置标签"]).toContain("时间单位");
    expect(source["输入框组合"]).toContain("input-combo-demo__loose");
    expect(source["字数统计"].match(/Input\.TextArea/g)).toHaveLength(3);
    expect(source["格式化输入值"]).toContain("按下回车键时清除首尾空格：");
  });

  it("keeps the legacy layout containers instead of replacing them with Space", () => {
    const source = Object.fromEntries(inputDemos.map((demo) => [demo.id, demo.tsxSource]));
    expect(source["输入框状态"]).toContain('className="input-demo-state-row"');
    expect(source["前后缀"]).toContain('className="input-affix-demo"');
    expect(source["搜索框"]).toContain('className="input-search-demo"');
    expect(source["搜索框-Loading"]).toContain('className="input-search-demo"');
    expect(source["文本域"]).toContain('className="input-textarea-demo"');
    expect(source["适应文本高度文本域"]).toContain(
      'className="input-textarea-demo input-textarea-auto-demo"',
    );
    expect(source["密码输入"]).toContain('className="input-password-demo"');
    for (const id of ["输入框状态", "前后缀", "搜索框", "搜索框-Loading", "密码输入"]) {
      expect(source[id]).not.toContain("<Space");
    }
  });

  it("reuses the public Dropdown and icon-library components in compound demos", () => {
    const source = Object.fromEntries(inputDemos.map((demo) => [demo.id, demo.tsxSource]));
    expect(source["前置、后置标签"]).toContain("Dropdown");
    expect(source["前置、后置标签"]).not.toContain("<select");
    expect(source["输入框组合"]).toContain("Dropdown");
    expect(source["输入框组合"]).not.toContain("<select");
    expect(source["前置、后置标签"]).toContain("<Button");
    expect(source["前置、后置标签"]).not.toContain("<button");
    expect(source["输入框组合"]).toContain("<Button");
    expect(source["输入框组合"]).not.toContain("<button");
    expect(source["前置、后置标签"]).not.toContain("qizhi-dropdown__arrow");
    expect(source["输入框组合"]).not.toContain("qizhi-dropdown__arrow");
    expect(source["前后缀"]).toContain("UserIcon");
    expect(source["前后缀"]).toContain("InfoIcon");
    expect(source["前后缀"]).toContain("SearchIcon");
  });

  it("keeps one search example and exposes the bounded scrolling textarea", () => {
    const source = Object.fromEntries(inputDemos.map((demo) => [demo.id, demo.tsxSource]));
    expect(source["搜索框"].match(/<Input\.Search/g)).toHaveLength(1);
    expect(source["搜索框-Loading"].match(/<Input\.Search/g)).toHaveLength(1);
    expect(source["适应文本高度文本域"]).toContain("maxRows: 6");
    expect(source["适应文本高度文本域"]).toContain("Array.from");
  });

  it("renders the approved demos, API, and shell-ready event", async () => {
    let readyCount = 0;
    const handleReady = () => { readyCount += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);
    render(<InputDocsIsland />);
    expect(screen.getByRole("heading", { name: "输入框 Input" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(14);
    expect(screen.getAllByRole("button", { name: "复制样式" })).toHaveLength(14);
    expect(screen.getByRole("table", { name: "Input API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Input.TextArea API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Input.Group API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Input.Search API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Input.Password API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Input Ref 方法" })).toBeInTheDocument();
    await waitFor(() => expect(readyCount).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });

  it("documents the approved core v1 API", () => {
    expect(inputApi.map((item) => item.name)).toEqual(expect.arrayContaining([
      "value", "defaultValue", "size", "status", "allowClear", "prefix", "suffix",
      "addBefore", "addAfter", "maxLength", "showWordLimit", "normalize", "autoWidth",
    ]));
    expect(inputApiSections.map((section) => section.title)).toEqual([
      "Input",
      "Input.TextArea",
      "Input.Group",
      "Input.Search",
      "Input.Password",
      "Ref 方法",
    ]);
    expect(inputApiSections.flatMap((section) => section.items.map((item) => item.name)))
      .not.toEqual(expect.arrayContaining([
        "error",
        "clearIcon",
        "beforeStyle",
        "afterStyle",
        "onPressEnter",
        "compact",
        "visibilityToggle",
      ]));
  });

  it("uses inline-code emphasis only for API identifiers being explained", () => {
    const emphasized = inputApiSections.flatMap((section) =>
      section.items.flatMap((item) => item.description.match(/`([^`]+)`/g) ?? []),
    );
    expect(emphasized).toEqual([
      "`errorOnly`",
      "`maxLength`",
      "`normalize`",
      "`errorOnly`",
      "`maxLength`",
    ]);
  });
});

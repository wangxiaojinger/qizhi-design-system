import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectDocsIsland } from "./SelectDocsIsland";
import { selectApi, selectOptionCardApi } from "./selectApi";
import { selectDemos } from "./selectDocs.registry";
import CardDescriptionDemo from "./demos/CardDescriptionDemo";
import CardIconFieldsDemo from "./demos/CardIconFieldsDemo";
import CardNameFieldsDemo from "./demos/CardNameFieldsDemo";
import CardSelectionDemo from "./demos/CardSelectionDemo";

const legacyTitles = ["基础用法", "允许清除", "多选模式", "带有前置标签", "允许创建", "搜索", "远程搜索", "自定义弹出框宽度", "不同尺寸", "指定可选项", "自动分词", "自定义触发节点", "扩展菜单", "联动", "隐藏已选择项", "拖拽排序", "宽度自适应", "最大标签数"];
const informationCardTitles = ["名称与字段信息", "图标与属性", "悬停补充信息", "选择后关联信息"];

describe("Select docs", () => {
  it("在扩展菜单后保留旧站 18 组 Demo 并插入四个信息卡片选项", () => {
    expect(selectDemos.map((demo) => demo.title)).toEqual([
      ...legacyTitles.slice(0, 13),
      ...informationCardTitles,
      ...legacyTitles.slice(13),
    ]);
    expect(selectDemos).toHaveLength(22);
    selectDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length))).toBeLessThanOrEqual(80);
    });
  });

  it("在扩展菜单后渲染信息卡片分节、四个 Demo 和两组 API", () => {
    render(<SelectDocsIsland />);
    const sectionTitle = screen.getByRole("heading", {
      level: 2,
      name: "信息卡片选项",
    });
    const extendedMenu = screen.getByRole("heading", {
      level: 2,
      name: "扩展菜单",
    });
    expect(
      extendedMenu.compareDocumentPosition(sectionTitle) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(24);
    informationCardTitles.forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });
    expect(document.getElementById("select-API")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "SelectOptionCard API" })).toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("API 元数据覆盖 Select 的补充说明和信息卡片公开属性", () => {
    expect(selectApi.map((item) => item.name)).toEqual(expect.arrayContaining(["options", "mode", "value", "onChange", "showSearch", "dropdownRender", "popupWidth", "renderOptionDescription"]));
    expect(selectApi.map((item) => String(item.name))).not.toContain("triggerProps");
    expect(selectOptionCardApi.map((item) => item.name)).toEqual(["name", "fields"]);
  });

  it("展示已确认的项目名称、优先级和预算字段", () => {
    const { unmount } = render(<CardNameFieldsDemo />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("智能科研平台")).toBeInTheDocument();
    expect(screen.getByText("量化研究项目")).toBeInTheDocument();
    expect(screen.getAllByText("高优项目-10")).toHaveLength(2);
    expect(screen.getByText("93956.01元")).toBeInTheDocument();
    expect(screen.getByText("1174149.03元")).toBeInTheDocument();
    unmount();
  });

  it("展示已确认的 CPU-Public 和 H800-Public 资源字段", () => {
    const { unmount } = render(<CardIconFieldsDemo />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("CPU-Public")).toBeInTheDocument();
    expect(screen.getByText("CPU资源")).toBeInTheDocument();
    expect(screen.getByText("58核1115.92GB")).toBeInTheDocument();
    expect(screen.getByText("H800-Public")).toBeInTheDocument();
    expect(screen.getByText("NVIDIA H800（80GB）")).toBeInTheDocument();
    expect(screen.getByText("2040核26216.84GB61卡")).toBeInTheDocument();
    unmount();
  });

  it("展示镜像信息卡并由 Select 提供镜像状态和描述", () => {
    const { unmount } = render(<CardDescriptionDemo />);
    fireEvent.click(screen.getByRole("combobox"));
    const image = screen.getByRole("option", {
      name: /sandbox-base:ubuntu24\.04-py3\.12-1\.0\.3/,
    });
    expect(within(image).getByText("支持的算力厂商：")).toBeInTheDocument();
    expect(within(image).getByText("支持的 CPU 架构：")).toBeInTheDocument();
    fireEvent.mouseEnter(image);
    expect(screen.getByText("镜像状态：创建成功")).toBeInTheDocument();
    expect(screen.getByText(/镜像描述：/)).toBeInTheDocument();
    unmount();
  });

  it("选中镜像后仅回填支持的算力厂商和 CPU 架构，清除后移除", () => {
    render(<CardSelectionDemo />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", {
      name: /sandbox-base:ubuntu24\.04-py3\.12-1\.0\.3/,
    }));
    expect(screen.getByText("支持的算力厂商：")).toBeInTheDocument();
    expect(screen.getByText("通用")).toBeInTheDocument();
    expect(screen.getByText("支持的 CPU 架构：")).toBeInTheDocument();
    expect(screen.getByText("x86")).toBeInTheDocument();
    expect(screen.queryByText("关联信息")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "清除选择" }));
    expect(screen.queryByText("支持的算力厂商：")).not.toBeInTheDocument();
  });
});

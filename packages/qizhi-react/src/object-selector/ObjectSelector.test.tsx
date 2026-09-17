import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ObjectSelector } from "./ObjectSelector";
import type { ObjectSelectorItem } from "./ObjectSelector.types";

const items: readonly ObjectSelectorItem[] = [
  {
    value: "inf-v2",
    name: "INF-v2-8k",
    description: "面向通用文本生成的基础模型。",
    meta: "@ kevin　生成于 具身智能　|　面向通用文本生成",
    project: "embodied",
    versions: [
      { value: "V2", description: "推理性能优化" },
      { value: "V1", description: "初始版本" },
    ],
  },
  {
    value: "inf-128k",
    name: "INF-v1-128k",
    description: "支持 128K 长上下文的语言模型。",
    meta: "@ anyi　生成于 具身智能　|　支持长上下文",
    project: "embodied",
    versions: [
      { value: "V3", description: "支持更稳定的长上下文推理" },
      { value: "V2", description: "模型存储路径更新" },
      { value: "V1", description: "初始版本" },
    ],
  },
  {
    value: "vision",
    name: "INF-1.5-vision-pro",
    description: "具备优秀的多模态理解和指令遵循能力。",
    meta: "@ anyi　生成于 其他项目　|　视觉语言模型",
    project: "other",
    versions: [
      { value: "V2", description: "提升图文理解能力" },
      { value: "V1", description: "初始版本" },
    ],
  },
];

const renderSelector = (onChange = vi.fn()) => {
  render(
    <ObjectSelector
      label="选择模型"
      items={items}
      projects={[
        { label: "全部", value: "all" },
        { label: "具身智能", value: "embodied" },
        { label: "其他项目", value: "other" },
      ]}
      defaultValue={{ object: "inf-v2", version: "V2" }}
      onChange={onChange}
    />,
  );
  return onChange;
};

describe("ObjectSelector", () => {
  it("renders the committed value and reopens from the switch action", async () => {
    renderSelector();
    expect(screen.getByText("INF-v2-8k")).toBeInTheDocument();
    expect(screen.getByText("V2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /切换/ }));
    expect(screen.getByRole("dialog", { name: "选择模型" })).toBeInTheDocument();
  });

  it("filters the actual object list by search and project", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /切换/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "搜索模型" }), {
      target: { value: "vision" },
    });
    expect(screen.getByRole("option", { name: /INF-1.5-vision-pro/ })).toBeVisible();
    expect(screen.queryByRole("option", { name: /INF-v2-8k/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox", { name: "筛选所属项目" }));
    fireEvent.click(screen.getByRole("option", { name: "所属项目：具身智能" }));
    expect(screen.queryByRole("option", { name: /INF-1.5-vision-pro/ })).not.toBeInTheDocument();
  });

  it("keeps the legacy object icon container in every object option", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /切换/ }));
    const options = screen.getAllByRole("option");
    expect(options).not.toHaveLength(0);
    options.forEach((option) => {
      expect(option.querySelector(".qizhi-object-option__icon svg"))
        .toBeInTheDocument();
    });
  });

  it("resets the version when the object changes and commits only a complete draft", () => {
    const onChange = renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /切换/ }));
    fireEvent.click(screen.getByRole("option", { name: /INF-v1-128k/ }));
    expect(screen.getByRole("button", { name: "确认" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: /V3/ }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(onChange).toHaveBeenCalledWith({ object: "inf-128k", version: "V3" }, items[1]);
    expect(screen.getByText("INF-v1-128k")).toBeInTheDocument();
    expect(screen.getByText("V3")).toBeInTheDocument();
  });

  it("cycles through visible objects with vertical arrow keys", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /切换/ }));
    const first = screen.getByRole("option", { name: /INF-v2-8k/ });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: /INF-v1-128k/ }))
      .toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "确认" })).toBeDisabled();
  });

  it("rolls back a draft on cancel and restores focus", async () => {
    renderSelector();
    const switchButton = screen.getByRole("button", { name: /切换/ });
    fireEvent.click(switchButton);
    fireEvent.click(screen.getByRole("option", { name: /INF-v1-128k/ }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("INF-v2-8k")).toBeInTheDocument();
    await waitFor(() => expect(switchButton).toHaveFocus());
  });
});

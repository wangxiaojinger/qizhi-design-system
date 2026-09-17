import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("AI lifecycle workbench component composition", () => {
  it("uses the public QIZHI framework, navigation, journey, metrics and project components", () => {
    const { container } = render(<App />);

    expect(container.querySelectorAll(".qizhi-platform-shell")).toHaveLength(1);
    expect(container.querySelectorAll(".qizhi-top-navigation"))
      .toHaveLength(1);
    expect(container.querySelector(".topbar")).toBeNull();
    expect(container.querySelector(".primary-nav-shell")).toBeNull();
    expect(container.querySelector(".account-actions")).toBeNull();
    expect(screen.getByRole("menubar", { name: "顶部导航" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "问候语" }))
      .not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /华为乌兰察布/ }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /简体中文/ }))
      .toBeInTheDocument();
    expect(screen.getByRole("list", { name: "AI 征程三步引导" }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /交互式建模|分布式训练|高性能计算|模型评测|专属实例|动态实例|弹性任务/ }))
      .toHaveLength(7);
    expect(screen.getAllByRole("link", { name: /进入项目/ }))
      .toHaveLength(2);
  });
});

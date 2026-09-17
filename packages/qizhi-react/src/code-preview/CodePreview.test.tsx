import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as QizhiReact from "../index";
import { CodePreview } from "./CodePreview";

describe("CodePreview", () => {
  it("renders highlighted read-only code with line numbers", () => {
    render(
      <CodePreview
        value={'const name = "QIZHI";\nconsole.log(name);'}
        language="typescript"
      />,
    );

    expect(screen.getByLabelText("代码预览")).toHaveTextContent("QIZHI");
    expect(screen.getAllByTestId("code-line-number")).toHaveLength(2);
  });

  it("falls back to plain text for an unknown runtime language", () => {
    render(<CodePreview value="alpha < beta" language={"unknown" as never} />);

    expect(screen.getByLabelText("代码预览")).toHaveTextContent("alpha < beta");
  });

  it("copies and downloads only when public controls are enabled", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodePreview
        value="echo QIZHI"
        language="shell"
        downloadable
        fileName="demo.sh"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "复制代码" }));
    expect(writeText).toHaveBeenCalledWith("echo QIZHI");
    expect(screen.getByRole("link", { name: "下载代码" })).toHaveAttribute(
      "download",
      "demo.sh",
    );
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<CodePreview value="" loading />);
    expect(screen.getByLabelText("正在加载代码")).toBeInTheDocument();

    rerender(<CodePreview value="" emptyText="暂无代码" />);
    expect(screen.getByText("暂无代码")).toBeInTheDocument();
  });

  it("exports CodePreview from the package root", () => {
    expect(QizhiReact.CodePreview).toBe(CodePreview);
  });
});

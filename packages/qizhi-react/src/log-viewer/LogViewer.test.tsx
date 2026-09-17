import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as QizhiReact from "../index";
import { LogViewer } from "./LogViewer";

const logs = [
  { id: "1", timestamp: "10:00:00", level: "info" as const, message: "实例启动" },
  { id: "2", timestamp: "10:00:01", level: "error" as const, message: "连接失败" },
];

describe("LogViewer", () => {
  it("renders and searches within supplied logs", async () => {
    const user = userEvent.setup();
    render(<LogViewer logs={logs} searchable />);

    await user.type(screen.getByRole("textbox", { name: "搜索日志" }), "失败");

    expect(screen.queryByText("实例启动")).not.toBeInTheDocument();
    expect(screen.getByText("连接失败")).toBeInTheDocument();
  });

  it("prevents duplicate refresh while refreshing", () => {
    const onRefresh = vi.fn();
    render(
      <LogViewer
        logs={logs}
        refreshable
        refreshing
        onRefresh={onRefresh}
      />,
    );

    const refresh = screen.getByRole("button", { name: "正在刷新日志" });
    expect(refresh).toBeDisabled();
    fireEvent.click(refresh);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("pauses following after the user scrolls away from the bottom", () => {
    const onAutoFollowChange = vi.fn();
    render(
      <LogViewer
        logs={logs}
        autoFollow
        onAutoFollowChange={onAutoFollowChange}
      />,
    );

    const viewport = screen.getByLabelText("运行日志内容");
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 600 },
      clientHeight: { configurable: true, value: 200 },
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    fireEvent.scroll(viewport);

    expect(onAutoFollowChange).toHaveBeenCalledWith(false);
  });

  it("filters the allowed levels and shows line numbers", async () => {
    const user = userEvent.setup();
    render(
      <LogViewer
        logs={logs}
        levelFilter={["info", "error"]}
        showLineNumbers
      />,
    );

    await user.click(screen.getByLabelText("筛选日志等级"));
    await user.click(screen.getByText("错误"));

    expect(screen.queryByText("实例启动")).not.toBeInTheDocument();
    expect(screen.getByText("连接失败")).toBeInTheDocument();
    expect(screen.getByText("1", { selector: ".qizhi-log-viewer__line-number" })).toBeInTheDocument();
  });

  it("exports LogViewer from the package root", () => {
    expect(QizhiReact.LogViewer).toBe(LogViewer);
  });
});

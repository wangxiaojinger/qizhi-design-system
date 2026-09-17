import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  test("renders the documented defaults and native attributes", () => {
    render(<Alert content="Here is an example text" data-testid="alert" />);
    const alert = screen.getByTestId("alert");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveClass("qizhi-alert--info", "qizhi-alert--default");
    expect(alert).toHaveTextContent("Here is an example text");
    expect(alert.querySelector(".qizhi-alert__icon svg")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "关闭提示" })).not.toBeInTheDocument();
  });

  test.each(["info", "success", "warning", "error", "neutral"] as const)(
    "renders %s type",
    (type) => {
      render(<Alert content={type} type={type} data-testid={`alert-${type}`} />);
      expect(screen.getByTestId(`alert-${type}`)).toHaveClass(`qizhi-alert--${type}`);
    },
  );

  test.each([
    ["info", "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z"],
    ["success", "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"],
    ["warning", "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"],
    ["error", "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"],
  ] as const)("renders the legacy filled %s status icon", (type, expectedPath) => {
    render(<Alert content={type} type={type} data-testid={`filled-${type}`} />);
    const svg = screen.getByTestId(`filled-${type}`).querySelector(".qizhi-alert__icon svg");
    const path = svg?.querySelector("path");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg?.querySelectorAll("path,circle")).toHaveLength(1);
    expect(path).toHaveAttribute("d", expectedPath);
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(path).not.toHaveAttribute("fill-opacity");
  });

  test.each(["small", "default", "large"] as const)("renders %s size", (size) => {
    render(<Alert content={size} size={size} data-testid={`alert-${size}`} />);
    expect(screen.getByTestId(`alert-${size}`)).toHaveClass(`qizhi-alert--${size}`);
  });

  test("supports title, inline, banner, hidden icon and custom icon", () => {
    const { rerender } = render(<Alert content="Content" title="Title" inline banner
      showIcon={false} data-testid="alert" />);
    expect(screen.getByTestId("alert")).toHaveClass(
      "qizhi-alert--with-title",
      "qizhi-alert--inline",
      "qizhi-alert--banner",
    );
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("alert").querySelector(".qizhi-alert__icon")).toBeNull();
    rerender(<Alert content="Content" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  test("closes once and calls onClose", () => {
    const onClose = vi.fn();
    render(<Alert content="Closable" closable onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "关闭提示" }));
    expect(screen.queryByText("Closable")).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("passes close to a custom close element", () => {
    render(<Alert content="Custom close" closeElement={(close) => (
      <button type="button" onClick={close}>确认并关闭</button>
    )} />);
    fireEvent.click(screen.getByRole("button", { name: "确认并关闭" }));
    expect(screen.queryByText("Custom close")).not.toBeInTheDocument();
  });
});

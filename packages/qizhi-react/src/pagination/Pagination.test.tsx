import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../index";

describe("Pagination", () => {
  it("pages through the basic uncontrolled state", async () => {
    const user = userEvent.setup();
    render(<Pagination total={50} aria-label="基础分页" />);
    expect(screen.getByRole("button", { name: "第 1 页" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "下一页" }));
    expect(screen.getByRole("button", { name: "第 2 页" })).toHaveAttribute("aria-current", "page");
  });

  it("folds long page ranges and jumps five pages", async () => {
    const user = userEvent.setup();
    render(<Pagination total={200} defaultCurrent={5} />);
    expect(screen.getByRole("button", { name: "向前 5 页" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "向后 5 页" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "向后 5 页" }).querySelectorAll("circle")).toHaveLength(3);
    expect([...screen.getByRole("button", { name: "向后 5 页" }).querySelectorAll("circle")].map((circle) => circle.getAttribute("cy"))).toEqual(["8", "8", "8"]);
    await user.click(screen.getByRole("button", { name: "向后 5 页" }));
    expect(screen.getByRole("button", { name: "第 10 页" })).toHaveAttribute("aria-current", "page");
  });

  it("resets to page one when page size changes", async () => {
    const user = userEvent.setup();
    const changes: Array<[number, number]> = [];
    render(<Pagination total={200} defaultCurrent={5} showPageSize onChange={(page, size) => changes.push([page, size])} />);
    await user.click(screen.getByRole("combobox", { name: "每页条数" }));
    await user.click(screen.getByRole("option", { name: "20 条/页" }));
    expect(screen.getByRole("button", { name: "第 1 页" })).toHaveAttribute("aria-current", "page");
    expect(changes.at(-1)).toEqual([1, 20]);
  });

  it("clamps jumper input, clears it, and retains focus", async () => {
    const user = userEvent.setup();
    render(<Pagination total={200} showJumper />);
    const input = screen.getByRole("spinbutton", { name: "跳转页码" });
    expect(input).toHaveClass("qizhi-input__field");
    expect(input.closest(".qizhi-input")).toBeInTheDocument();
    await user.type(input, "99{Enter}");
    expect(screen.getByRole("button", { name: "第 20 页" })).toHaveAttribute("aria-current", "page");
    expect(input).toHaveValue(null);
    expect(input).toHaveFocus();
  });

  it("supports simple, total renderer, controlled state, and disabled state", async () => {
    const user = userEvent.setup();
    const requests: number[] = [];
    const { rerender } = render(<Pagination total={95} current={2} simple showTotal={(total, range) => `${range[0]}–${range[1]} / ${total} 条`} onChange={(page) => requests.push(page)} />);
    expect(screen.getByText("11–20 / 95 条")).toBeInTheDocument();
    const input = screen.getByRole("spinbutton", { name: "当前页码" });
    await user.clear(input); await user.type(input, "4{Enter}");
    expect(requests).toEqual([4]);
    expect(input).toHaveFocus();
    rerender(<Pagination total={95} disabled showPageSize showJumper />);
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("button").every((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByRole("spinbutton", { name: "跳转页码" })).toBeDisabled();
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputTag } from "./InputTag";

describe("InputTag", () => {
  it("commits tags with Enter and comma, then removes the last tag with Backspace", async () => {
    const user = userEvent.setup();
    render(<InputTag defaultValue={["北京"]} aria-label="城市标签" />);
    const input = screen.getByRole("textbox", { name: "城市标签" });

    await user.type(input, "上海{Enter}广州,");
    expect(screen.getByText("上海")).toBeInTheDocument();
    expect(screen.getByText("广州")).toBeInTheDocument();

    await user.type(input, "{Backspace}");
    expect(screen.queryByText("广州")).not.toBeInTheDocument();
    expect(screen.getByText("上海")).toBeInTheDocument();
  });

  it("removes one tag and clears all tags while restoring input focus", async () => {
    const user = userEvent.setup();
    render(<InputTag defaultValue={["北京", "上海"]} aria-label="城市标签" />);
    const input = screen.getByRole("textbox", { name: "城市标签" });

    await user.click(screen.getByRole("button", { name: "删除 北京" }));
    expect(screen.queryByText("北京")).not.toBeInTheDocument();
    expect(input).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "清空" }));
    expect(screen.queryByText("上海")).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("emits labelInValue objects without losing existing values", async () => {
    const user = userEvent.setup();
    const changes: unknown[] = [];
    render(
      <InputTag
        labelInValue
        defaultValue={[{ label: "选项一", value: "1" }]}
        onChange={(value) => changes.push(value)}
        aria-label="选项标签"
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "选项标签" }), "选项二{Enter}");
    expect(changes.at(-1)).toEqual([
      { label: "选项一", value: "1" },
      { label: "选项二", value: "选项二" },
    ]);
  });

  it("rejects false validation results and accepts formatted values", async () => {
    const user = userEvent.setup();
    const formatted: unknown[] = [];
    const { container, rerender } = render(
      <InputTag validate={(input) => input.length > 3} aria-label="校验标签" />,
    );

    await user.type(screen.getByRole("textbox", { name: "校验标签" }), "abc{Enter}");
    expect(screen.queryByText("abc")).not.toBeInTheDocument();
    expect(container.querySelector(".qizhi-input-tag")).toHaveClass("qizhi-input-tag--error");

    rerender(
      <InputTag
        validate={(input) => ({ word: input })}
        onChange={(value) => formatted.push(value)}
        aria-label="格式化标签"
      />,
    );
    const formattedInput = screen.getByRole("textbox", { name: "格式化标签" });
    await user.clear(formattedInput);
    await user.type(formattedInput, "QIZHI{Enter}");
    expect(formatted.at(-1)).toEqual([{ word: "QIZHI" }]);
  });

  it("saves a pending value on blur", async () => {
    const user = userEvent.setup();
    render(<InputTag saveOnBlur aria-label="失焦保存" />);
    const input = screen.getByRole("textbox", { name: "失焦保存" });
    await user.type(input, "待保存");
    await user.tab();
    expect(screen.getByText("待保存")).toBeInTheDocument();
  });

  it("renders fixed hidden counts without compressing visible tags", () => {
    const { container } = render(
      <InputTag
        defaultValue={["1", "2", "3", "4", "5"]}
        maxTagCount={3}
        renderMore={(count) => `+${count}`}
        aria-label="最大标签数"
      />,
    );
    expect(within(container).getAllByText(/^[1-3]$/)).toHaveLength(3);
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(container.querySelector(".qizhi-input-tag__input"))
      .toHaveClass("qizhi-input-tag__input--collapsed");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input component family", () => {
  it("Search submits by Enter and button while loading blocks duplicate searches", async () => {
    const user = userEvent.setup();
    const searches: string[] = [];
    const { rerender } = render(<Input.Search defaultValue="模型" searchButton onSearch={(value) => searches.push(value)} />);
    await user.click(screen.getByRole("button", { name: "搜索" }));
    await user.click(screen.getByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(searches).toEqual(["模型", "模型"]);

    rerender(<Input.Search defaultValue="模型" searchButton loading onSearch={(value) => searches.push(value)} />);
    expect(screen.getByRole("button", { name: "搜索中" })).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(searches).toEqual(["模型", "模型"]);
  });

  it("Search replaces its suffix with a loading indicator while loading", () => {
    const { container } = render(<Input.Search loading defaultValue="QIZHI" placeholder="搜索" />);
    expect(container.querySelector(".qizhi-input-search__spinner")).toBeInTheDocument();
    expect(container.querySelector('[data-icon="icon-加载中"]')).toBeInTheDocument();
    expect(container.querySelector('[data-icon="icon-搜索-搜索"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
  });

  it("Search keeps the search suffix and does not expose one-click clearing", () => {
    const { container } = render(<Input.Search defaultValue="QIZHI" />);
    expect(container.querySelector(".qizhi-input-search.qizhi-input--has-clear"))
      .not.toBeInTheDocument();
    expect(container.querySelector(".qizhi-input__clear")).not.toBeInTheDocument();
    expect(container.querySelector('[data-icon="icon-搜索-搜索"]')).toBeInTheDocument();
  });

  it("Search marks its button addon as a primary search action", () => {
    const { container } = render(<Input.Search searchButton defaultValue="QIZHI" />);
    expect(screen.getByRole("button", { name: "搜索" }).parentElement)
      .toHaveClass("qizhi-input__addon--search");
    expect(container.querySelector('[data-icon="icon-搜索-搜索"]')).toBeInTheDocument();
  });

  it("Password toggles visibility and restores focus", async () => {
    const user = userEvent.setup();
    render(<Input.Password defaultValue="password" />);
    const input = screen.getByDisplayValue("password");
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "显示密码" })
      .querySelector('[data-icon="icon-眼睛-隐藏"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "显示密码" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveFocus();
    expect(screen.getByRole("button", { name: "隐藏密码" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "隐藏密码" })
      .querySelector('[data-icon="icon-眼睛-可见"]')).toBeInTheDocument();
  });

  it("TextArea supports word count and auto-size row bounds", async () => {
    const user = userEvent.setup();
    render(<Input.TextArea maxLength={5} showWordLimit autoSize={{ minRows: 2, maxRows: 6 }} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "2");
    expect(textarea.closest(".qizhi-textarea")).toHaveClass("qizhi-textarea--auto-size");
    await user.type(textarea, "QIZHI");
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("Group provides compact layout without owning child behavior", () => {
    render(<Input.Group aria-label="电话"><Input addBefore="+86" aria-label="号码" /><Input readOnly value="分机" aria-label="分机" /></Input.Group>);
    expect(screen.getByRole("group", { name: "电话" })).toHaveClass("qizhi-input-group");
    expect(screen.getByRole("textbox", { name: "号码" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "分机" })).toHaveAttribute("readonly");
  });

  it("keeps addon height aligned when consumers set a custom height", () => {
    const { container } = render(
      <Input addBefore="+86" style={{ height: 40 }} aria-label="号码" />,
    );
    expect(container.querySelector(".qizhi-input__group")).toHaveStyle({
      "--qizhi-input-height": "40px",
    });
  });

  it("exposes disabled and readonly states on the TextArea root", () => {
    const { container, rerender } = render(
      <Input.TextArea disabled aria-label="描述" />,
    );
    expect(container.querySelector(".qizhi-textarea"))
      .toHaveClass("qizhi-textarea--disabled");

    rerender(<Input.TextArea readOnly aria-label="描述" />);
    expect(container.querySelector(".qizhi-textarea"))
      .toHaveClass("qizhi-textarea--readonly");
  });
});

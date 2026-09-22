import { fireEvent, render, screen } from "@testing-library/react";
import { ButtonDocsIsland } from "./ButtonDocsIsland";

it("renders the preserved Button contract and API", () => {
  render(<ButtonDocsIsland />);
  expect(screen.getByRole("heading", { name: "按钮 Button" })).toBeInTheDocument();
  for (const name of ["基本用法", "图标按钮", "按钮形状", "按钮尺寸", "按钮状态", "禁用按钮", "加载中按钮", "长按钮", "API"]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("article")).toHaveLength(8);
  expect(
    screen.getByRole("row", { name: /^loading 按钮是否是加载状态 boolean false$/ }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Button.Group" })).not.toBeInTheDocument();
  expect(
    screen.getByRole("row", { name: /type.*五种类型值.*secondary 和 default 均为中性线框次要按钮.*default/ }),
  ).toBeInTheDocument();
  const viewCodeButton = screen.getAllByRole("button", { name: "查看代码" })[0];
  const copyCodeButton = screen.getAllByRole("button", { name: "复制代码" })[0];
  expect(viewCodeButton).toHaveClass("qizhi-btn", "qizhi-btn-secondary", "qizhi-btn-has-icon");
  expect(copyCodeButton).toHaveClass("qizhi-btn", "qizhi-btn-secondary", "qizhi-btn-has-icon");
  expect(viewCodeButton.querySelector(".ri-code-s-slash-line")).not.toBeNull();
  expect(copyCodeButton.querySelector(".ri-file-copy-line")).not.toBeNull();
  fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);
  expect(document.querySelector(".qizhi-code-token--keyword")).not.toBeNull();
  expect(document.querySelector(".qizhi-code-token--string")).not.toBeNull();
  expect([...document.querySelectorAll(".qizhi-code-token--keyword")].some((node) => node.textContent === "default")).toBe(true);
});

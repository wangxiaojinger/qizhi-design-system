import { act, fireEvent, render, screen } from "@testing-library/react";
import { ConfigPopconfirmIsland } from "./ConfigPopconfirmIsland";

describe("ConfigPopconfirmIsland", () => {
  it("keeps the public Popconfirm synchronized with provider locale", async () => {
    const provider = document.createElement("div");
    provider.dataset.configProviderDemo = "";
    provider.dataset.locale = "zh-CN";
    const root = document.createElement("div");
    root.dataset.reactIsland = "config-popconfirm";
    provider.append(root);
    document.body.append(provider);
    render(<ConfigPopconfirmIsland />, { container: root });

    fireEvent.click(screen.getByRole("button", { name: "确认操作" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确定要继续吗？");
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    await act(async () => {
      provider.dataset.locale = "en-US";
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm action" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Are you sure you want to continue?",
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeVisible();
  });
});

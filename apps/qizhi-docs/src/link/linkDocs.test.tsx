import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkDocsIsland } from "./LinkDocsIsland";
import { linkApi } from "./linkApi";
import { linkDemos } from "./linkDocs.registry";

describe("Link docs", () => {
  it("notifies the document shell to rebuild the table of contents after mounting", async () => {
    let readyCount = 0;
    const handleReady = () => { readyCount += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);
    render(<LinkDocsIsland />);
    await waitFor(() => expect(readyCount).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });

  it("keeps the approved demo order", () => {
    expect(linkDemos.map((demo) => demo.id)).toEqual([
      "基础用法",
      "其他状态",
      "图标",
      "悬浮状态样式",
      "配合 Dropdown 使用",
    ]);
  });

  it("uses raw TSX from the same demo modules shown in previews", () => {
    expect(linkDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
  });

  it("renders the approved demos and Link API", () => {
    render(<LinkDocsIsland />);
    expect(screen.getByRole("heading", { name: "链接 Link" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "基础用法" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "配合 Dropdown 使用" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Link API" })).toBeInTheDocument();
  });

  it("shows only one enabled link and one disabled link in the basic demo", () => {
    render(<LinkDocsIsland />);
    const basicDemo = document.getElementById("基础用法");
    expect(basicDemo).not.toBeNull();
    const links = within(basicDemo!).getAllByText("Link", { exact: true });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "#components-link");
    expect(links[1]).toHaveAttribute("aria-disabled", "true");
  });

  it("publishes only the approved v1 API names", () => {
    expect(linkApi.map((item) => item.name)).toEqual([
      "children",
      "status",
      "disabled",
      "hoverable",
      "icon",
      "href",
      "target",
      "rel",
      "download",
      "htmlType",
      "className",
      "style",
      "onClick",
    ]);
    expect(linkApi.map((item) => item.name)).not.toContain("loading");
    expect(linkApi.map((item) => item.name)).not.toContain("size");
  });

  it("uses the formal Dropdown component in the approved composition demo", async () => {
    const user = userEvent.setup();
    render(<LinkDocsIsland />);
    const demo = document.getElementById("配合 Dropdown 使用");
    await user.click(within(demo!).getAllByRole("button", { name: "City" })[0]);
    expect(screen.getByRole("menuitem", { name: "北京" })).toBeVisible();
  });
});

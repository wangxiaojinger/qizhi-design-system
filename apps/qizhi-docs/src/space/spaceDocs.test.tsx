import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SpaceDocsIsland } from "./SpaceDocsIsland";
import { spaceApi } from "./spaceApi";
import { spaceDemos } from "./spaceDocs.registry";

describe("Space docs", () => {
  it("notifies the shell and preserves all five legacy demos in order", async () => {
    let readyCount = 0;
    const onReady = () => { readyCount += 1; };
    window.addEventListener("qizhi:react-island-ready", onReady);
    render(<SpaceDocsIsland />);
    await waitFor(() => expect(readyCount).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", onReady);
    expect(spaceDemos.map((demo) => demo.id)).toEqual([
      "space-vertical",
      "space-size",
      "space-align",
      "space-wrap",
      "space-split",
    ]);
  });

  it("uses real QIZHI controls and same-source TSX", () => {
    render(<SpaceDocsIsland />);
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Item/ }).length).toBeGreaterThan(20);
    expect(spaceDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
    expect(spaceDemos.every((demo) => !demo.source.includes("<button"))).toBe(true);
  });

  it("updates size and alignment through the full segmented path", () => {
    render(<SpaceDocsIsland />);
    fireEvent.click(screen.getByRole("radio", { name: "large" }));
    expect(document.querySelector("#space-size .qizhi-space")).toHaveClass("qizhi-space-size-large");
    fireEvent.click(screen.getByRole("radio", { name: "baseline" }));
    expect(document.querySelector("#space-align .qizhi-space")).toHaveClass("qizhi-space--align-baseline");
  });

  it("publishes only the approved public API", () => {
    expect(spaceApi.map((item) => item.name)).toEqual([
      "wrap", "align", "direction", "split", "className", "size", "style",
    ]);
    expect(spaceApi.find((item) => item.name === "align")?.defaultValue).toBe("—");
    expect(spaceApi.find((item) => item.name === "size")?.type)
      .toBe("SpaceSize | readonly [number, number]");
    render(<SpaceDocsIsland />);
    expect(screen.getByRole("heading", { name: "SpaceSize" })).toBeInTheDocument();
    expect(screen.getByLabelText("SpaceSize 类型定义")).toHaveTextContent(
      'export type SpaceSize = "mini" | "small" | "medium" | "large" | number;',
    );
  });
});

import { readFileSync } from "node:fs";

const styles = readFileSync(
  "packages/qizhi-react/src/task-overview/taskOverview.css",
  "utf8",
);

describe("TaskOverview responsive metric grid", () => {
  it("owns one 24px inset on the whole overview instead of its children", () => {
    expect(styles).toContain(
      ".qizhi-task-overview { width:1016px; padding:24px; box-sizing:border-box;",
    );
    expect(styles).not.toContain("padding:0 24px");
    expect(styles).toContain(
      ".qizhi-task-overview__results { margin:12px 0 0;",
    );
    expect(styles).not.toContain("min-height:56px");
    expect(styles).toContain("margin-bottom:20px");
  });

  it("keeps metric cards between 230px and 320px and adds columns when space allows", () => {
    expect(styles).toContain(
      "grid-template-columns:repeat(auto-fit,minmax(230px,1fr))",
    );
    expect(styles).toContain("max-width:320px");
  });
});

import pageSource from "../../../../index.html?raw";

describe("Popconfirm island entry", () => {
  it("replaces the legacy runtime with the Popconfirm React island", () => {
    expect(pageSource).toContain(
      'id="component-popconfirm" data-react-island="popconfirm"',
    );
    expect(pageSource).toContain(
      'src="/apps/qizhi-docs/src/popconfirm/main.tsx"',
    );
  });

  it("reuses React Popconfirm in the global config consumer", () => {
    expect(pageSource).toContain(
      'data-react-island="config-popconfirm"',
    );
    expect(pageSource).toContain(
      'src="/apps/qizhi-docs/src/config-popconfirm/main.tsx"',
    );
    expect(pageSource).not.toContain("data-config-popconfirm");
  });
});

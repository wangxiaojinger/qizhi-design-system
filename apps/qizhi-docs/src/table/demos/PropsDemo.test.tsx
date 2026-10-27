import { fireEvent, render, screen, within } from "@testing-library/react";
import { Table } from "@wangxiaojinger/qizhi-react";
import PropsDemo from "./PropsDemo";

const previewTable = () => screen.getByRole("table", { name: "属性预览表格" });

const openSettings = () => {
  fireEvent.click(screen.getByRole("switch", { name: "列显隐" }));
  fireEvent.click(screen.getByRole("button", { name: "列显隐" }));
};

describe("PropsDemo", () => {
  it("renders local model catalog data with the approved engineering defaults", () => {
    render(<PropsDemo />);

    for (const label of ["悬浮高亮", "表头", "两行省略", "全文提示", "容器固定列断点"]) {
      expect(screen.getByRole("switch", { name: label })).toBeChecked();
    }
    for (const label of ["边框", "列调宽", "单元格边框", "复选框", "加载中", "列移动", "列显隐", "自定义空态", "无数据"]) {
      expect(screen.getByRole("switch", { name: label })).not.toBeChecked();
    }
    const table = previewTable();
    expect(within(table).getByText("Qways-R1-Enterprise")).toBeInTheDocument();
    expect(within(table).getByText("0")).toBeInTheDocument();
    expect(within(table).getAllByText("未开通").length).toBeGreaterThan(0);
    expect(screen.getByText("演示数据，不代表真实服务")).toBeInTheDocument();
    expect(screen.getAllByRole("switch").at(-1)).toHaveAccessibleName("无数据");
    expect(screen.queryByRole("switch", { name: "斑马纹" })).not.toBeInTheDocument();
    expect(screen.queryByText("试用")).not.toBeInTheDocument();
  });

  it.each(["列移动", "列调宽"])(
    "allows %s to close without removing the visibility settings entry", (label) => {
    render(<PropsDemo />);

    openSettings();
    fireEvent.click(screen.getByRole("switch", { name: label }));
    fireEvent.click(screen.getByRole("switch", { name: label }));
    expect(screen.queryByRole("spinbutton")).toBeNull();
    if (label === "列移动") expect(screen.queryByRole("button", { name: /移动列/ })).toBeNull();
    if (label === "列调宽") expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
  });

  it("keeps the controlled layout after the move capability is closed and restored", () => {
    render(<PropsDemo />);

    fireEvent.click(screen.getByRole("switch", { name: "列移动" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "移动列 说明" }), { key: "ArrowRight" });
    const headers = () => [...previewTable().querySelectorAll("th[data-column-key]")]
      .map((header) => header.getAttribute("data-column-key"));

    expect(headers().indexOf("status")).toBeLessThan(headers().indexOf("description"));
    fireEvent.click(screen.getByRole("switch", { name: "列移动" }));
    fireEvent.click(screen.getByRole("switch", { name: "列移动" }));
    expect(headers().indexOf("status")).toBeLessThan(headers().indexOf("description"));
  });

  it("shows the visibility entry only when visibility is enabled", () => {
    render(<PropsDemo />);

    expect(screen.queryByRole("button", { name: "列显隐" })).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: "列显隐" }));
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "列显隐" }));
    expect(screen.queryByRole("button", { name: "列显隐" })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "列设置入口" })).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: "列显隐" }));
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
  });

  it("uses body loading without replacing the current model rows", () => {
    render(<PropsDemo />);

    fireEvent.click(screen.getByRole("switch", { name: "加载中" }));
    expect(previewTable().closest(".qizhi-table")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector(".qizhi-table__loading[data-scope='body']"))
      .toBeInTheDocument();
    expect(within(previewTable()).getByText("Qways-R1-Enterprise")).toBeInTheDocument();
  });

  it("applies 36px padding to default and custom empty states", () => {
    render(<PropsDemo />);

    fireEvent.click(screen.getByRole("switch", { name: "无数据" }));
    const padding = () => previewTable().querySelector(".qizhi-table__empty-content");
    expect(padding()).toHaveStyle({ paddingBlock: "36px" });
    expect(within(previewTable()).getByText("暂无数据")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "自定义空态" }));
    expect(padding()).toHaveStyle({ paddingBlock: "36px" });
    expect(within(previewTable()).getByText("暂无匹配的模型")).toBeInTheDocument();
  });

  it("uses two-line text and allows restoring natural wrapping", () => {
    render(<PropsDemo />);

    const leaf = previewTable().querySelector<HTMLElement>(".qizhi-table__text.is-rows-2");
    expect(leaf).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "两行省略" }));
    expect(previewTable().querySelector(".qizhi-table__text.is-rows-2")).toBeNull();
  });

  it("does not substitute a React false value with the empty cell placeholder", () => {
    render(
      <Table
        aria-label="false 值占位校验"
        rowKey="key"
        columns={[{ key: "enabled", title: "启用", dataIndex: "enabled" }]}
        dataSource={[{ key: "row-1", enabled: false }]}
        emptyCell="-"
      />,
    );

    const cell = screen.getByRole("cell");
    expect(cell.querySelector(".qizhi-table__cell")).toBeEmptyDOMElement();
    expect(cell).not.toHaveTextContent("-");
  });
});

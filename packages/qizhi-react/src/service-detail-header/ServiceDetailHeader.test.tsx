import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceDetailHeader } from "./ServiceDetailHeader";

it("审计图标提示仅显示字段名，不包含具体值", async () => {
  const user = userEvent.setup();
  render(<ServiceDetailHeader title="测试服务" creator="林猫猫" createdAt="2026-09-09" updatedAt="2026-09-09" tabs={[]} versions={[]} />);
  for (const label of ["创建人", "创建时间"]) {
    await user.hover(screen.getByLabelText(label));
    expect(await screen.findByRole("tooltip")).toHaveTextContent(new RegExp(`^${label}$`));
    await user.unhover(screen.getByLabelText(label));
  }
});

it("受控版本跟随业务更新且只读列表不触发版本变更", async () => {
  const user = userEvent.setup();
  const onVersionChange = vi.fn();
  const props = { title: "MCP", creator: "林猫猫", createdAt: "2026-09-08", updatedAt: "2026-09-08", tabs: [], versions: [{ key: "v1", name: "V1", time: "—", operator: "—", initial: "—", action: "回滚" }], versionReadOnly: true, onVersionChange };
  const { rerender } = render(<ServiceDetailHeader {...props} version="V1" />);
  rerender(<ServiceDetailHeader {...props} version="V2" />);
  await user.click(screen.getByRole("button", { name: "查看部署版本 V2" }));
  expect(screen.queryByText("回滚")).not.toBeInTheDocument();
  expect(screen.getByRole("table", { name: "版本信息" })).toHaveTextContent("V1");
  expect(onVersionChange).not.toHaveBeenCalled();
});

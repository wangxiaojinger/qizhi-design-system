import { fireEvent, render, screen } from "@testing-library/react";
import {
  BasicChoiceCards,
  BusinessGuide,
  IconChoiceCards,
  ServiceDetailHeader,
  TaskOverview,
} from "./index";

describe("complete business components", () => {
  it("renders a custom BusinessGuide header action", () => {
    render(<BusinessGuide title="开始" highlight="AI" subtitle="说明" steps={[]}
      headerAction={<button>打开调试台</button>} />);
    expect(screen.getByRole("button", { name: "打开调试台" })).toBeInTheDocument();
  });
  it("owns the BusinessGuide close and restore flow", () => {
    const onClose = vi.fn();
    const onRestore = vi.fn();
    render(<BusinessGuide title="开启" highlight="AI" subtitle="征程"
      steps={[{ step: "第一步", title: "创建", image: "/guide.svg",
        actions: [{ content: "开始" }] }]}
      onClose={onClose} onRestore={onRestore} />);
    const close = screen.getByRole("button", { name: "关闭业务引导" });
    expect(close.firstElementChild).toHaveClass("qizhi-btn__label");
    expect(close.lastElementChild).toHaveClass("qizhi-btn__icon");
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "重新显示" }));
    expect(onRestore).toHaveBeenCalledOnce();
  });

  it("owns TaskOverview type filtering and expansion", () => {
    render(<TaskOverview defaultType="training" spaces={["全部"]}
      initialVisibleCount={1}
      metrics={[{ key: "training", title: "训练", total: 2,
        label: "运行中", value: 2 }]}
      tasks={[
        { key: "one", type: "training", name: "任务一", space: "空间",
          spaceValue: "空间", resource: "A100", duration: "1小时", status: "运行中" },
        { key: "two", type: "training", name: "任务二", space: "空间",
          spaceValue: "空间", resource: "A100", duration: "2小时", status: "运行中" },
      ]} />);
    expect(screen.queryByText("任务二")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
    expect(screen.getByText("任务二")).toBeInTheDocument();
  });

  it("enumerates plain space names and filters task cards by space", () => {
    render(<TaskOverview defaultType="training"
      spaces={["全部", "具身智能实验室", "科研 Agent 评测"]}
      metrics={[{ key: "training", title: "训练", total: 2,
        label: "运行中", value: 2 }]}
      tasks={[
        { key: "one", type: "training", name: "任务一", space: "具身智能实验室",
          spaceValue: "具身智能实验室", resource: "A100", duration: "1小时", status: "运行中" },
        { key: "two", type: "training", name: "任务二", space: "科研 Agent 评测",
          spaceValue: "科研 Agent 评测", resource: "A100", duration: "2小时", status: "运行中" },
      ]} />);

    const select = screen.getByRole("combobox", { name: "筛选空间" });
    expect(document.querySelector(".qizhi-select__before"))
      .not.toBeInTheDocument();
    expect(select).toHaveValue("空间：全部");
    fireEvent.click(select);
    expect(screen.getAllByRole("option").map((option) => option.textContent))
      .toEqual(["全部", "具身智能实验室", "科研 Agent 评测"]);
    fireEvent.click(screen.getByRole("option", { name: "具身智能实验室" }));
    expect(select).toHaveValue("空间：具身智能实验室");
    expect(screen.getByText("任务一")).toBeInTheDocument();
    expect(screen.queryByText("任务二")).not.toBeInTheDocument();
  });

  it("owns both choice-card group variants", () => {
    const onBasicChange = vi.fn();
    const items = [
      { value: "public", title: "公共实例", description: "共享资源" },
      { value: "dedicated", title: "专属实例", description: "独享资源" },
    ];
    render(<><BasicChoiceCards items={items} defaultValue="public"
      onChange={onBasicChange} />
      <IconChoiceCards items={items.map((item) => ({ ...item, icon: "图标" }))}
        defaultValue="public" /></>);
    fireEvent.click(screen.getAllByRole("radio", { name: /专属实例/ })[0]);
    expect(onBasicChange).toHaveBeenCalledWith("dedicated");
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
  });

  it("owns service status and version drawer behavior", () => {
    const onStatusChange = vi.fn();
    render(<ServiceDetailHeader title="服务详情" serviceId="service-1"
      framework="自定义" creator="林猫猫" maintainers={[]}
      createdAt="2026-08-31" updatedAt="2026-08-31"
      onStatusChange={onStatusChange}
      tabs={[{ key: "basic", title: "基本信息" }]}
      versions={[{ key: "v1", name: "V1", time: "2026-08-31",
        operator: "林猫猫", initial: "林", action: "当前版本", disabled: true }]} />);
    fireEvent.click(screen.getByRole("button", { name: "下线" }));
    expect(onStatusChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("已下线")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {
      name: "查看部署版本 V1",
    }));
    expect(screen.getByRole("dialog", { name: "版本列表" })).toBeInTheDocument();
  });
});

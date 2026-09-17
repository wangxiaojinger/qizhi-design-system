import { render, screen } from "@testing-library/react";
import { DetailHeader } from "./DetailHeader";

describe("DetailHeader", () => {
  it("renders the complete semantic detail summary from public slots", () => {
    const { container } = render(
      <DetailHeader
        icon={<span>服务图形</span>}
        title="自定义-医疗服务详情"
        status={{ label: "服务中", tone: "online" }}
        action={<button type="button">下线</button>}
        properties={[
          { label: "ID", value: "dlc1bgehaev9iiaz" },
          { label: "部署框架｜服务方式", value: "自定义" },
          { label: "部署版本", value: "V1", plain: true },
        ]}
        audit={<span>renji</span>}
        tabs={<span>基本信息</span>}
      />,
    );

    const article = container.querySelector("article.qizhi-detail-header");
    expect(article).toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("heading", { name: "自定义-医疗服务详情" })).toBeInTheDocument();
    expect(screen.getByText("服务中").closest(".qizhi-detail-header__status"))
      .toHaveClass("qizhi-detail-header__status--online");
    expect(screen.getByText("下线")).toBeInTheDocument();
    expect(screen.getByText("部署版本")).toBeInTheDocument();
    expect(screen.getByText("V1")).toBeInTheDocument();
    expect(screen.getByText("V1").closest("div"))
      .toHaveClass("qizhi-detail-header__property--plain");
    expect(screen.getByText("renji")).toBeInTheDocument();
    expect(screen.getByText("基本信息")).toBeInTheDocument();
  });

  it("exposes the offline state without owning business state", () => {
    const { rerender } = render(
      <DetailHeader title="服务" status={{ label: "服务中", tone: "online" }} />,
    );
    rerender(<DetailHeader title="服务" status={{ label: "已下线", tone: "offline" }} />);
    expect(screen.getByText("已下线").closest(".qizhi-detail-header__status"))
      .toHaveClass("qizhi-detail-header__status--offline");
  });
});

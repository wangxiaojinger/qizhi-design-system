import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal separator with the approved defaults", () => {
    render(<Divider data-testid="divider" />);

    expect(screen.getByTestId("divider")).toHaveClass(
      "qizhi-divider",
      "qizhi-divider--horizontal",
      "qizhi-divider--solid",
    );
    expect(screen.getByTestId("divider")).toHaveAttribute("role", "separator");
    expect(screen.getByTestId("divider")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("supports dashed and dotted horizontal separators", () => {
    const { rerender } = render(<Divider lineStyle="dashed" data-testid="divider" />);
    expect(screen.getByTestId("divider")).toHaveClass("qizhi-divider--dashed");

    rerender(<Divider lineStyle="dotted" data-testid="divider" />);
    expect(screen.getByTestId("divider")).toHaveClass("qizhi-divider--dotted");
  });

  it("renders horizontal text at the requested orientation", () => {
    render(<Divider orientation="left">章节标题</Divider>);

    const divider = screen.getByRole("separator");
    expect(divider).toHaveClass("qizhi-divider--with-text", "qizhi-divider--orientation-left");
    expect(screen.getByText("章节标题")).toHaveClass("qizhi-divider__text");
  });

  it("renders a vertical separator without horizontal text", () => {
    render(<Divider type="vertical">不会渲染</Divider>);

    const divider = screen.getByRole("separator");
    expect(divider).toHaveClass("qizhi-divider--vertical");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.queryByText("不会渲染")).not.toBeInTheDocument();
  });

  it("forwards native attributes, className, style, and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Divider
        ref={ref}
        className="consumer-divider"
        style={{ marginBlock: 20 }}
        aria-label="内容分组"
        data-testid="divider"
      />,
    );

    expect(ref.current).toBe(screen.getByTestId("divider"));
    expect(ref.current).toHaveClass("consumer-divider");
    expect(ref.current).toHaveStyle({ marginBlock: "20px" });
    expect(ref.current).toHaveAccessibleName("内容分组");
  });
});

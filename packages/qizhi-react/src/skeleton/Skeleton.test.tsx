import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders the approved three-row text default", () => {
    render(<Skeleton />);

    const root = screen.getByRole("status", { name: "内容加载中" });
    const rows = root.querySelectorAll(".qizhi-skeleton__row");
    expect(root).toHaveClass("qizhi-skeleton");
    expect(root.querySelector(".qizhi-skeleton__image")).not.toBeInTheDocument();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveStyle({ width: "100%" });
    expect(rows[1]).toHaveStyle({ width: "100%" });
    expect(rows[2]).toHaveStyle({ width: "60%" });
  });

  it("supports public image shape, size, row count and widths", () => {
    render(
      <Skeleton
        image={{ shape: "square", size: 48 }}
        text={{ rows: 3, widths: ["100%", 600, 400] }}
        aria-label="图文内容加载中"
      />,
    );

    const root = screen.getByRole("status", { name: "图文内容加载中" });
    const image = root.querySelector(".qizhi-skeleton__image");
    const rows = root.querySelectorAll(".qizhi-skeleton__row");
    expect(image).toHaveClass("qizhi-skeleton__image--square");
    expect(image).toHaveStyle({ width: "48px", height: "48px" });
    expect(rows[0]).toHaveStyle({ width: "100%" });
    expect(rows[1]).toHaveStyle({ width: "min(100%, 600px)" });
    expect(rows[2]).toHaveStyle({ width: "min(100%, 400px)" });
  });

  it("exposes animation as component state and supports reduced content", () => {
    const { rerender } = render(
      <Skeleton animation image={{ shape: "circle" }} text={false} />,
    );
    const root = screen.getByRole("status");
    expect(root).toHaveClass("qizhi-skeleton--animated");
    expect(root.querySelector(".qizhi-skeleton__image"))
      .toHaveClass("qizhi-skeleton__image--circle");
    expect(root.querySelector(".qizhi-skeleton__text")).not.toBeInTheDocument();

    rerender(<Skeleton animation={false} image={false} text={{ rows: 1 }} />);
    expect(root).not.toHaveClass("qizhi-skeleton--animated");
    expect(root.querySelector(".qizhi-skeleton__image")).not.toBeInTheDocument();
    expect(root.querySelectorAll(".qizhi-skeleton__row")).toHaveLength(1);
  });

  it("forwards native attributes, className and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Skeleton
        ref={ref}
        className="custom-skeleton"
        data-testid="skeleton"
      />,
    );
    expect(screen.getByTestId("skeleton"))
      .toHaveClass("qizhi-skeleton", "custom-skeleton");
    expect(ref.current).toBe(screen.getByTestId("skeleton"));
  });
});

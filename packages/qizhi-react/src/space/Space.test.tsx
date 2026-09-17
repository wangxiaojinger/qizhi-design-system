import { render, screen } from "@testing-library/react";
import { Space } from "./Space";

it("uses the documented small horizontal centered defaults", () => {
  render(<Space data-testid="space"><button>一</button><button>二</button></Space>);
  expect(screen.getByTestId("space")).toHaveClass(
    "qizhi-space",
    "qizhi-space--horizontal",
    "qizhi-space--align-center",
    "qizhi-space-size-small",
  );
});

it("supports vertical direction, alignment and wrapping as public behavior", () => {
  render(<Space direction="vertical" align="end" wrap data-testid="space">
    <button>一</button><button>二</button>
  </Space>);
  expect(screen.getByTestId("space")).toHaveClass(
    "qizhi-space--vertical",
    "qizhi-space--align-end",
    "qizhi-space--wrap",
  );
});

it("inserts the public split element only between children", () => {
  render(<Space split={<i data-testid="split" />}><span>一</span><span>二</span><span>三</span></Space>);
  expect(screen.getAllByTestId("split")).toHaveLength(2);
});

it("supports a custom column and row gap without losing consumer styles", () => {
  render(<Space size={[12, 18]} style={{ color: "red" }} data-testid="space" />);
  const space = screen.getByTestId("space");
  expect(space.style.color).toBe("red");
  expect(space).toHaveStyle({
    "--qizhi-space-column-gap": "12px",
    "--qizhi-space-row-gap": "18px",
  });
});

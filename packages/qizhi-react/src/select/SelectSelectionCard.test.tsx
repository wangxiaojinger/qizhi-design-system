import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SelectSelectionCard } from "./SelectSelectionCard";

it("renders shared selection fields and forwards accessible layout attributes", () => {
  const { rerender } = render(<SelectSelectionCard aria-label="镜像信息" className="layout" fields={[{ key: "vendor", label: "支持的算力厂商", value: "通用" }]} />);
  expect(screen.getByLabelText("镜像信息")).toHaveClass("qizhi-select-selection-card", "layout");
  expect(screen.getByText("支持的算力厂商：")).toBeInTheDocument();
  rerender(<SelectSelectionCard fields={[{ key: "vendor", label: "支持的算力厂商", value: "英伟达" }]} />);
  expect(screen.queryByText("通用")).not.toBeInTheDocument();
  expect(screen.getByText("英伟达")).toBeInTheDocument();
});

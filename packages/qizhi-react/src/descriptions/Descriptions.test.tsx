import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Descriptions } from "./Descriptions";
import "./descriptions.css";

describe("Descriptions", () => {
  it("uses the approved defaults and semantic description elements", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Descriptions ref={ref} title="项目信息" data-testid="descriptions" aria-label="项目详情">
        <Descriptions.Item label="版本">1.0.0</Descriptions.Item>
      </Descriptions>,
    );
    const root = screen.getByTestId("descriptions");

    expect(root).toHaveClass(
      "qizhi-descriptions",
      "qizhi-descriptions-layout-horizontal",
      "qizhi-descriptions-label-align-left",
    );
    expect(root).toHaveAttribute("aria-label", "项目详情");
    expect(root.querySelector(".qizhi-descriptions__title")).toHaveTextContent("项目信息");
    expect(root.querySelector("dl dt")).toHaveTextContent("版本");
    expect(root.querySelector("dl dd")).toHaveTextContent("1.0.0");
    expect(ref.current).toBe(root);
  });

  it("omits an empty title and supports vertical right-align input without changing semantics", () => {
    const itemRef = createRef<HTMLDivElement>();
    render(
      <Descriptions layout="vertical" labelAlign="right" data-testid="descriptions">
        <Descriptions.Item ref={itemRef} label={<span>负责人</span>} data-field="owner">
          <strong>Design Team</strong>
        </Descriptions.Item>
      </Descriptions>,
    );
    const root = screen.getByTestId("descriptions");

    expect(root).toHaveClass("qizhi-descriptions-layout-vertical", "qizhi-descriptions-label-align-right");
    expect(root.querySelector(".qizhi-descriptions__title")).not.toBeInTheDocument();
    expect(itemRef.current).toHaveAttribute("data-field", "owner");
    expect(itemRef.current?.querySelector("dt span")).toHaveTextContent("负责人");
    expect(itemRef.current?.querySelector("dd strong")).toHaveTextContent("Design Team");
  });
});

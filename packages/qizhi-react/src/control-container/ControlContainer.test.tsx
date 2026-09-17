import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoComplete } from "../auto-complete/AutoComplete";
import { Cascader } from "../cascader/Cascader";
import { DatePicker } from "../date-picker/DatePicker";
import { Input } from "../input/Input";
import { Select } from "../select/Select";

describe("统一控件容器结构", () => {
  it("marks the visual boundary for all five input components", () => {
    const { container } = render(
      <>
        <Input aria-label="输入框" />
        <Select aria-label="选择器" options={[{ label: "北京", value: "beijing" }]} />
        <Cascader aria-label="级联选择" options={[{ label: "北京", value: "beijing" }]} />
        <DatePicker />
        <AutoComplete aria-label="自动补全" data={["北京"]} />
      </>,
    );

    expect(container.querySelector(".qizhi-input")).toHaveClass("qizhi-control-container");
    expect(container.querySelector(".qizhi-select__control")).toHaveClass("qizhi-control-container");
    expect(container.querySelector(".qizhi-cascader")).toHaveClass("qizhi-control-container");
    expect(container.querySelector(".qizhi-date-picker")).toHaveClass("qizhi-control-container");
    expect(container.querySelector(".qizhi-auto-complete > .qizhi-input")).toHaveClass("qizhi-control-container");
  });

  it("makes the TextArea wrapper own the visual box", () => {
    const { container } = render(<Input.TextArea aria-label="多行输入框" />);
    expect(container.querySelector(".qizhi-textarea__control")).toHaveClass("qizhi-control-container");
    expect(container.querySelector(".qizhi-textarea__control > textarea")).toHaveClass("qizhi-textarea__field");
  });
});

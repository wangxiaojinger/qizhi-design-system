import { createRef } from "react";
import { expect, test } from "vitest";
import { Checkbox } from "./Checkbox";
import type { CheckboxProps, CheckboxValue } from "./Checkbox.types";

test("Checkbox 暴露已审定的 ref 与事件类型", () => {
  const ref = createRef<HTMLInputElement>();
  const value: CheckboxValue = "A";
  const node = <Checkbox ref={ref} value={value} onChange={(checked, event) => { const next: boolean = checked; const input: HTMLInputElement = event.currentTarget; void next; void input; }}>选项</Checkbox>;
  expect(node.props.value).toBe("A");
});

test("Checkbox 不接收未审定的尺寸或按钮型 API", () => {
  const props: CheckboxProps = {};
  void props;
  // @ts-expect-error Checkbox v1 没有 size
  <Checkbox size="large">选项</Checkbox>;
  // @ts-expect-error Checkbox v1 没有 type 变体
  <Checkbox type="button">选项</Checkbox>;
});

import { createRef } from "react";
import { expectTypeOf, test } from "vitest";
import { Switch } from "./Switch";
import type { SwitchProps, SwitchSize } from "./Switch.types";

test("Switch 对外类型与实现一致", () => {
  const ref = createRef<HTMLButtonElement>();
  const props: SwitchProps = {
    ref,
    size: "small",
    defaultChecked: true,
    checkedText: "开",
    uncheckedText: "关",
    onChange: (checked, event) => {
      expectTypeOf(checked).toEqualTypeOf<boolean>();
      const button: HTMLButtonElement = event.currentTarget;
      expectTypeOf(button).toMatchTypeOf<HTMLElement>();
    },
  };

  expectTypeOf<SwitchSize>().toEqualTypeOf<"default" | "small">();
  <Switch {...props} />;
});

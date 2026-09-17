import { createRef } from "react";
import { expectTypeOf, test } from "vitest";
import { Spin } from "./Spin";
import type { SpinProps, SpinSize } from "./Spin.types";

test("accepts only the approved Spin sizes and native div attributes", () => {
  expectTypeOf<SpinSize>().toEqualTypeOf<20 | 30 | 40>();
  const props: SpinProps = {
    loading: true,
    size: 30,
    block: true,
    "aria-label": "加载中",
    ref: createRef<HTMLDivElement>(),
  };
  <Spin {...props} />;

  // @ts-expect-error Spin v1 does not expose arbitrary numeric sizes
  <Spin size={24} />;
  // @ts-expect-error Spin v1 does not expose string sizes
  <Spin size="small" />;
});

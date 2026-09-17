import type { ComponentProps } from "react";
import { expectTypeOf, test } from "vitest";
import { Steps } from "./Steps";

type Props = ComponentProps<typeof Steps>;

// @ts-expect-error Steps v1 has no direction API.
const invalidDirection: Props["direction"] = "vertical";

test("accepts only the approved Steps state API", () => {
  expectTypeOf<Props["size"]>()
    .toEqualTypeOf<"default" | "small" | undefined>();
  expectTypeOf<Props["status"]>()
    .toEqualTypeOf<"process" | "error" | undefined>();
  void invalidDirection;
});

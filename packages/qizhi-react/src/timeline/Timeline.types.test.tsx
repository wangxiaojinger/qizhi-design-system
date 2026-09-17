import type { ComponentProps } from "react";
import { expectTypeOf, test } from "vitest";
import { Timeline, TimelineItem } from "./Timeline";
import type {
  TimelineDirection,
  TimelineItemPosition,
  TimelineLabelPosition,
  TimelineLineType,
  TimelineMode,
} from "./Timeline.types";

test("Timeline exposes only the confirmed v1 unions", () => {
  expectTypeOf<TimelineDirection>().toEqualTypeOf<"vertical" | "horizontal">();
  expectTypeOf<TimelineMode>().toEqualTypeOf<"left" | "right" | "alternate">();
  expectTypeOf<TimelineLabelPosition>().toEqualTypeOf<"same" | "relative">();
  expectTypeOf<TimelineItemPosition>().toEqualTypeOf<"left" | "right">();
  expectTypeOf<TimelineLineType>().toEqualTypeOf<"solid" | "dashed">();
  expectTypeOf<ComponentProps<typeof Timeline>["reverse"]>().toEqualTypeOf<
    boolean | undefined
  >();
  expectTypeOf<ComponentProps<typeof TimelineItem>["dot"]>().not.toBeNever();
});


import { DatePicker } from "./DatePicker";
import { describe, expect, it } from "vitest";

const single = <DatePicker mode="quarter" value="2026-Q2" onChange={(value) => value.toUpperCase()} />;
const range = <DatePicker.RangePicker mode="month" value={["2026-01", "2026-08"]} onChange={(value) => value.join(",")} />;
const timed = <DatePicker showTime disabledTime={() => ({ disabledHours: [0, 1] })} hideDisabledTimeOptions />;

void single;
void range;
void timed;

describe("DatePicker types", () => {
  it("supports the documented single, range, and time contracts", () => {
    expect(single).toBeTruthy();
    expect(range).toBeTruthy();
    expect(timed).toBeTruthy();
  });
});

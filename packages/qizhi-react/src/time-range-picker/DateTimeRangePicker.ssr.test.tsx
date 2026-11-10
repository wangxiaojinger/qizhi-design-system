// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

it("renders its closed trigger without a browser document", () => {
  const html = renderToStaticMarkup(<DateTimeRangePicker value={{ start: 0, end: 3_600_000 }} onChange={() => undefined} />);
  expect(html).toContain("时间范围");
  expect(html).toContain('aria-expanded="false"');
});

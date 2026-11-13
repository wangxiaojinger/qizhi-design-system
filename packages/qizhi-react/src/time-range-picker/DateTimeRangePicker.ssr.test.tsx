// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

it("renders its closed trigger without a browser document", () => {
  const html = renderToStaticMarkup(<DateTimeRangePicker value={{ start: 0, end: 3_600_000 }} onChange={() => undefined} />);
  expect(html).toContain("开始时间");
  expect(html).toContain('aria-expanded="false"');
});

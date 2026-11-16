import { expect, it } from "vitest";
import { cssNumberToken, cssToken } from "./index";

it("publishes read-only CSS token helpers from the theme subpath", () => {
  document.body.style.setProperty("--spacing-8", "8px");
  expect(cssToken("--spacing-8")).toBe("8px");
  expect(cssNumberToken("--spacing-8")).toBe(8);
  document.body.style.removeProperty("--spacing-8");
});

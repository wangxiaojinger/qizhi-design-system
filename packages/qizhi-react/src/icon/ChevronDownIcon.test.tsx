import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ChevronDownIcon } from "./ChevronDownIcon";

describe("ChevronDownIcon", () => {
  test("uses the approved filled downward-arrow asset", () => {
    const { container } = render(<ChevronDownIcon />);
    const path = container.querySelector("path");

    expect(path).toHaveAttribute("d", "M7.99993 8.78092L11.2998 5.48111L12.2426 6.42392L7.99993 10.6666L3.75732 6.42392L4.70013 5.48111L7.99993 8.78092Z");
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(path).not.toHaveAttribute("stroke");
  });
});

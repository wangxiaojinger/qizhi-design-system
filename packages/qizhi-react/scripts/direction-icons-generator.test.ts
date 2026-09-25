import { describe, expect, it } from "vitest";
import {
  renderDirectionCompatibilityModule,
  renderDirectionIconComponent,
  transformDirectionSvg,
  validateDirectionSvg,
} from "./build-direction-icons.mjs";

const validSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="legacy-group"><path id="Vector" d="M2 2H14V14H2Z" fill="black" fill-opacity="0.45"/></g>
</svg>`;

describe("direction icon generator", () => {
  it("rejects unsafe or unsupported SVG input", () => {
    expect(() => validateDirectionSvg(validSvg.replace("viewBox", "data-view-box"))).toThrow(
      "viewBox",
    );
    expect(() => validateDirectionSvg(validSvg.replace("</svg>", "<script /></svg>"))).toThrow(
      "script",
    );
    expect(() => validateDirectionSvg(validSvg.replace("black", "#123456"))).toThrow(
      "paint",
    );
    expect(() => validateDirectionSvg(validSvg.replace("</svg>", "<image href=\"https://example.com/a.svg\" /></svg>"))).toThrow(
      "external",
    );
  });

  it("preserves geometry while removing legacy IDs, fixed size and paint opacity", () => {
    const result = transformDirectionSvg(validSvg);

    expect(result.viewBox).toBe("0 0 16 16");
    expect(result.jsx).toContain('d="M2 2H14V14H2Z"');
    expect(result.jsx).toContain('fill="currentColor"');
    expect(result.jsx).not.toContain("fillOpacity");
    expect(result.jsx).not.toContain("strokeOpacity");
    expect(result.jsx).not.toContain("legacy-group");
    expect(result.jsx).not.toContain('id="Vector"');
    expect(result.jsx).not.toContain('width="16"');
  });

  it("renders a deterministic component that uses the shared icon contract", () => {
    const component = renderDirectionIconComponent({
      componentName: "ExampleIcon",
      sourceFile: "source/direction/example.svg",
      svg: validSvg,
    });

    expect(component).toContain("由 scripts/build-direction-icons.mjs 生成，禁止手改");
    expect(component).toContain("createQizhiIcon(");
    expect(component).toContain('"ExampleIcon"');
    expect(component).toContain('"0 0 16 16"');
    expect(renderDirectionIconComponent({ componentName: "ExampleIcon", sourceFile: "source/direction/example.svg", svg: validSvg })).toBe(component);
  });

  it("rewrites compatibility modules as opacity-free aliases", () => {
    const module = renderDirectionCompatibilityModule(
      "ExpandRightDiagonalFilledIcon",
      "ExpandCollapseRightDiagonalExpandedFilledIcon",
    );

    expect(module).toContain(
      'export { ExpandRightDiagonalFilledIcon as ExpandCollapseRightDiagonalExpandedFilledIcon } from "./ExpandRightDiagonalFilledIcon";',
    );
    expect(module).not.toMatch(/opacity/i);
  });
});

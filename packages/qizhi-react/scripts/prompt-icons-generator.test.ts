import { describe, expect, it } from "vitest";
import {
  renderPromptIconComponent,
  transformPromptSvgMarkup,
  transformFixedPaletteSvg,
  validatePromptSvg,
  validateFixedPaletteSvg,
} from "./build-prompt-icons.mjs";

const successSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="legacy-group"><path id="Union" fill-rule="evenodd" clip-rule="evenodd" d="M1 1H15V15H1Z" fill="#52C41A"/></g>
</svg>`;

describe("fixed palette prompt icon generator", () => {
  it("removes paint opacity from currentColor prompt icons", () => {
    const item = { colorMode: "currentColor" };
    const currentColorSvg = successSvg
      .replace('fill="#52C41A"', 'fill="black" fill-opacity="0.45" stroke="black" stroke-opacity="0.45"');
    const result = transformPromptSvgMarkup(currentColorSvg, item);

    expect(result.markup).toContain('fill="currentColor"');
    expect(result.markup).toContain('stroke="currentColor"');
    expect(result.markup).not.toMatch(/(?:fill|stroke)-opacity=/i);
  });

  it("preserves the approved fixed paint instead of converting it to currentColor", () => {
    const result = transformFixedPaletteSvg(successSvg, ["#52C41A"]);

    expect(result.viewBox).toBe("0 0 16 16");
    expect(result.jsx).toContain('fill="#52C41A"');
    expect(result.jsx).not.toContain("currentColor");
    expect(result.jsx).toContain('fillRule="evenodd"');
    expect(result.jsx).toContain('clipRule="evenodd"');
    expect(result.jsx).not.toContain('id="Union"');
  });

  it("rejects unapproved paints, multiple paths and internal references", () => {
    expect(() => validateFixedPaletteSvg(successSvg.replace("#52C41A", "#000000"), ["#52C41A"])).toThrow("paint");
    expect(() => validateFixedPaletteSvg(successSvg.replace("</g>", '<path d="M0 0" fill="#52C41A" /></g>'), ["#52C41A"])).toThrow("one path");
    expect(() => validateFixedPaletteSvg(successSvg.replace("</svg>", '<path fill="url(#paint0)" /></svg>'), ["#52C41A"])).toThrow();
  });

  it("renders a deterministic component through the shared icon factory", () => {
    const component = renderPromptIconComponent({
      componentName: "StatusSuccessIcon",
      sourceFile: "source/prompt/status-success.svg",
      approvedPaints: ["#52C41A"],
      svg: successSvg,
    });

    expect(component).toContain("createQizhiIcon(");
    expect(component).toContain('fill="#52C41A"');
    expect(component).not.toContain("currentColor");
  });

  it("rejects foreignObject and prefixes gradient references for instance safety", () => {
    const item = { colorMode: "fixedPalette", fixedColors: ["#52C41A"] };
    expect(() => validatePromptSvg(successSvg.replace("</svg>", "<foreignObject /></svg>"), item)).toThrow("unsafe");
    const gradientSvg = successSvg
      .replace("<g id=\"legacy-group\">", '<defs><linearGradient id="paint0"><stop stop-color="#52C41A" /></linearGradient></defs><g>')
      .replace('fill="#52C41A"', 'fill="url(#paint0)"');
    const result = transformPromptSvgMarkup(gradientSvg, item);
    expect(result.markup).toContain('id="__QIZHI_ICON_ID__-paint0"');
    expect(result.markup).toContain('fill="url(#__QIZHI_ICON_ID__-paint0)"');
  });
});

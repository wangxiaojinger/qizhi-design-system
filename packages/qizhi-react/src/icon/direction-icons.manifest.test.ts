import { describe, expect, it } from "vitest";
import { directionIconManifest } from "./direction-icons.manifest";

describe("directionIconManifest", () => {
  it("maps paired outline and filled names to their visual SVG sources", () => {
    const sourceByName = Object.fromEntries(
      directionIconManifest.map((item) => [item.componentName, item.sourceNodeId]),
    );

    expect(sourceByName).toMatchObject({
      ExpandRightDiagonalIcon: "716:796",
      ExpandRightDiagonalFilledIcon: "716:788",
      CollapseRightDiagonalIcon: "716:792",
      CollapseRightDiagonalFilledIcon: "716:795",
      CollapseVerticalIcon: "716:793",
      CollapseVerticalFilledIcon: "716:790",
      ExpandVerticalIcon: "716:789",
      ExpandVerticalFilledIcon: "716:786",
      ExpandHorizontalIcon: "716:785",
      ExpandHorizontalFilledIcon: "716:787",
      CollapseHorizontalIcon: "716:794",
      CollapseHorizontalFilledIcon: "716:791",
      ExpandLeftDiagonalIcon: "716:783",
      ExpandLeftDiagonalFilledIcon: "716:784",
      CollapseLeftDiagonalIcon: "716:782",
      CollapseLeftDiagonalFilledIcon: "716:781",
      ArrowDownIcon: "715:548",
      ArrowDownFilledIcon: "715:695",
      ArrowUpIcon: "715:680",
      ArrowUpFilledIcon: "715:697",
      ArrowRightIcon: "77:486",
      ArrowRightFilledIcon: "715:696",
      ArrowLeftIcon: "715:681",
      ArrowLeftFilledIcon: "715:694",
      ExpandIcon: "715:725",
      ExpandFilledIcon: "715:723",
      ContractIcon: "715:722",
      ContractFilledIcon: "715:724",
    });
  });

  it("uses concise primary names and retains the original public names as compatibility aliases", () => {
    const first = directionIconManifest[0] as typeof directionIconManifest[0] & { compatibilityNames?: readonly string[] };

    expect(first.componentName).toBe("ExpandRightDiagonalFilledIcon");
    expect(first.compatibilityNames).toContain("ExpandCollapseRightDiagonalExpandedFilledIcon");
  });

  it("maps exactly 38 unique legacy sources to stable public identities", () => {
    expect(directionIconManifest).toHaveLength(38);

    for (const key of ["id", "componentName", "legacyName", "sourceNodeId"] as const) {
      const values = directionIconManifest.map((item) => item[key]);
      expect(new Set(values).size, key).toBe(38);
    }

    expect(directionIconManifest.filter((item) => item.style === "outline")).toHaveLength(23);
    expect(directionIconManifest.filter((item) => item.style === "fill")).toHaveLength(15);
  });

  it("keeps every public name, source and AI field internally consistent", () => {
    for (const item of directionIconManifest) {
      expect(item.id).toMatch(/^direction\.[a-z0-9.-]+$/);
      expect(item.componentName).toMatch(/^[A-Z][A-Za-z0-9]+Icon$/);
      expect(item.componentName.endsWith("FilledIcon")).toBe(item.style === "fill");
      expect(item.displayName).not.toBe("");
      expect(item.aliases.length).toBeGreaterThan(0);
      expect(item.semantic).toBe("direction");
      expect(item.colorMode).toBe("currentColor");
      expect(item.importPath).toBe("@wangxiaojinger/qizhi-react/icon");
      expect(item.sourceFile).toMatch(/^source\/direction\/\d{3}--legacy-direction--\d+-\d+\.svg$/);
      expect(item.sourceNodeId.replace(":", "-")).toBe(item.sourceFile.match(/--(\d+-\d+)\.svg$/)?.[1]);
    }
  });
});

import { readFileSync } from "node:fs";
import {
  BasicChoiceCards,
  BusinessGuide,
  IconChoiceCards,
  ServiceDetailHeader,
  TaskOverview,
} from "@wangxiaojinger/qizhi-react";
import { expect, test } from "vitest";

test("every confirmed complete business Demo has one public component", () => {
  expect([
    BusinessGuide,
    TaskOverview,
    BasicChoiceCards,
    IconChoiceCards,
    ServiceDetailHeader,
  ]).toHaveLength(5);
});

test("complete Demo sources call their business component directly", () => {
  const demos = [
    ["business-guidance/demos/BasicDemo.tsx", "BusinessGuide"],
    ["business-overview/demos/CombinationDemo.tsx", "TaskOverview"],
    ["business-object-selection/demos/BasicChoiceCardsDemo.tsx",
      "BasicChoiceCards"],
    ["business-object-selection/demos/IconChoiceCardsDemo.tsx",
      "IconChoiceCards"],
    ["business-detail-header/demos/BasicDemo.tsx", "ServiceDetailHeader"],
  ] as const;
  demos.forEach(([path, component]) => {
    const source = readFileSync(`apps/qizhi-docs/src/${path}`, "utf8");
    expect(source).toContain(`<${component}`);
  });
});

test("complete business component appearance is not retained in Demo CSS", () => {
  const guidanceCss = readFileSync(
    "apps/qizhi-docs/src/business-guidance/businessGuidanceDocs.css",
    "utf8",
  );
  const detailCss = readFileSync(
    "apps/qizhi-docs/src/business-detail-header/detailHeaderDocs.css",
    "utf8",
  );
  const overviewCss = readFileSync(
    "apps/qizhi-docs/src/business-overview/businessOverviewDocs.css",
    "utf8",
  );
  expect(guidanceCss).not.toContain(".business-guide-demo");
  expect(detailCss).not.toMatch(/\.detail-header-(audit|tabs|maintainers|version)/);
  expect(overviewCss).not.toContain(".qizhi-task-overview__");
});

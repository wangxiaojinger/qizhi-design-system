import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogViewerDocsIsland } from "./LogViewerDocsIsland";
import { logViewerDemos } from "./logViewerDocs.registry";
describe("LogViewer docs", () => { it("renders approved demos in order", () => { render(<LogViewerDocsIsland />); expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([...logViewerDemos.map((demo) => demo.title), "API"]); }); });

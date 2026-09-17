import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodePreviewDocsIsland } from "./CodePreviewDocsIsland";
import { codePreviewDemos } from "./codePreviewDocs.registry";
describe("CodePreview docs", () => { it("renders approved demos in order", () => { render(<CodePreviewDocsIsland />); expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([...codePreviewDemos.map((demo) => demo.title), "API"]); }); });

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QizhiProvider } from "./QizhiProvider";

afterEach(() => delete document.body.dataset.theme);
describe("QizhiProvider", () => { it("sets and clears the document theme attribute", () => { const { rerender } = render(<QizhiProvider theme="dark"><span>内容</span></QizhiProvider>); expect(document.body.dataset.theme).toBe("dark"); rerender(<QizhiProvider theme="light"><span>内容</span></QizhiProvider>); expect(document.body.dataset.theme).toBeUndefined(); }); });

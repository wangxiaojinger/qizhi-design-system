import { createRoot } from "react-dom/client";
import { MarkdownViewerDocsIsland } from "./MarkdownViewerDocsIsland";
const root = document.getElementById("component-markdown-viewer");
if (root) createRoot(root).render(<MarkdownViewerDocsIsland />);

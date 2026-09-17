import { createRoot } from "react-dom/client";
import { CodePreviewDocsIsland } from "./CodePreviewDocsIsland";
const root = document.getElementById("component-code-preview");
if (root) createRoot(root).render(<CodePreviewDocsIsland />);

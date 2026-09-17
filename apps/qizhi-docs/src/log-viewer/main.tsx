import { createRoot } from "react-dom/client";
import { LogViewerDocsIsland } from "./LogViewerDocsIsland";
const root = document.getElementById("component-log-viewer");
if (root) createRoot(root).render(<LogViewerDocsIsland />);

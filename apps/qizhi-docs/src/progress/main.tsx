import { createRoot } from "react-dom/client";
import { ProgressDocsIsland } from "./ProgressDocsIsland";

const root = document.getElementById("component-progress");
if (root) createRoot(root).render(<ProgressDocsIsland />);

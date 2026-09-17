import { createRoot } from "react-dom/client";
import { TreeSelectDocsIsland } from "./TreeSelectDocsIsland";

const root = document.getElementById("component-tree-select");
if (root) createRoot(root).render(<TreeSelectDocsIsland />);

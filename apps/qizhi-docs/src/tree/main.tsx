import { createRoot } from "react-dom/client";
import { TreeDocsIsland } from "./TreeDocsIsland";

const root = document.getElementById("component-tree");
if (root) createRoot(root).render(<TreeDocsIsland />);

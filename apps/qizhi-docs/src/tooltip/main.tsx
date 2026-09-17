import { createRoot } from "react-dom/client";
import { TooltipDocsIsland } from "./TooltipDocsIsland";

const root = document.getElementById("component-tooltip");
if (root) createRoot(root).render(<TooltipDocsIsland />);

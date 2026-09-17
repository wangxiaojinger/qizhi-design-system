import { createRoot } from "react-dom/client";
import { LayoutDocsIsland } from "./LayoutDocsIsland";

const root = document.getElementById("component-layout");
if (root) createRoot(root).render(<LayoutDocsIsland />);

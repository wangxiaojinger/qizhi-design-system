import { createRoot } from "react-dom/client";
import { MenuDocsIsland } from "./MenuDocsIsland";

const root = document.getElementById("component-menu");
if (root) createRoot(root).render(<MenuDocsIsland />);

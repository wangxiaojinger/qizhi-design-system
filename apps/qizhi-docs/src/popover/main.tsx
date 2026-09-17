import { createRoot } from "react-dom/client";
import { PopoverDocsIsland } from "./PopoverDocsIsland";

const root = document.getElementById("component-popover");
if (root) createRoot(root).render(<PopoverDocsIsland />);

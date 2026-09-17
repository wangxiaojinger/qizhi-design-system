import { createRoot } from "react-dom/client";
import { SwitchDocsIsland } from "./SwitchDocsIsland";

const root = document.getElementById("component-switch");
if (root) createRoot(root).render(<SwitchDocsIsland />);

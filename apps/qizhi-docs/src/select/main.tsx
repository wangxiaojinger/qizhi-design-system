import { createRoot } from "react-dom/client";
import { SelectDocsIsland } from "./SelectDocsIsland";
const root = document.getElementById("component-select");
if (root) createRoot(root).render(<SelectDocsIsland />);

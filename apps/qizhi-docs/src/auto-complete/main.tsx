import { createRoot } from "react-dom/client";
import { AutoCompleteDocsIsland } from "./AutoCompleteDocsIsland";

const root = document.getElementById("component-auto-complete");
if (root) createRoot(root).render(<AutoCompleteDocsIsland />);

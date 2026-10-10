import { createRoot } from "react-dom/client";
import { FilterSelectDocsIsland } from "./FilterSelectDocsIsland";

const root = document.getElementById("component-filter-select");
if (root) createRoot(root).render(<FilterSelectDocsIsland />);

import { createRoot } from "react-dom/client";
import { ChartDocsIsland } from "./ChartDocsIsland";

const root = document.getElementById("component-chart");
if (root) createRoot(root).render(<ChartDocsIsland />);

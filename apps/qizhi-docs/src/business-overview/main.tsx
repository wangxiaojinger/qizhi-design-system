import { createRoot } from "react-dom/client";
import { BusinessOverviewDocsIsland } from "./BusinessOverviewDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#business-overview-metrics[data-react-island="business-overview"]',
);
if (root) createRoot(root).render(<BusinessOverviewDocsIsland />);

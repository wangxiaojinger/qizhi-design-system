import { createRoot } from "react-dom/client";
import { BusinessGuidanceDocsIsland } from "./BusinessGuidanceDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#business-guidance-flow[data-react-island="business-guidance"]',
);
if (root) createRoot(root).render(<BusinessGuidanceDocsIsland />);

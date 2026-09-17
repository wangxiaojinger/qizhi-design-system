import { createRoot } from "react-dom/client";
import { BusinessObjectDisplayDocsIsland } from
  "./BusinessObjectDisplayDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#business-object-display[data-react-island="business-object-display"]',
);
if (root) createRoot(root).render(<BusinessObjectDisplayDocsIsland />);

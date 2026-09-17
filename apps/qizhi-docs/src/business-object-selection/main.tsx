import { createRoot } from "react-dom/client";
import { BusinessObjectSelectionDocsIsland } from "./BusinessObjectSelectionDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#business-object-selection[data-react-island="business-object-selection"]',
);
if (root) createRoot(root).render(<BusinessObjectSelectionDocsIsland />);

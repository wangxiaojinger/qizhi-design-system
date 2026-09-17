import { createRoot } from "react-dom/client";
import { DetailHeaderDocsIsland } from "./DetailHeaderDocsIsland";

const root = document.querySelector<HTMLElement>('#business-detail-header[data-react-island="business-detail-header"]');
if (root) createRoot(root).render(<DetailHeaderDocsIsland />);

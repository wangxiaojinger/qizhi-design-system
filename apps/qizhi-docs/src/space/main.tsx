import { createRoot } from "react-dom/client";
import { SpaceDocsIsland } from "./SpaceDocsIsland";

const root = document.querySelector<HTMLElement>('#component-space[data-react-island="space"]');
if (root) createRoot(root).render(<SpaceDocsIsland />);

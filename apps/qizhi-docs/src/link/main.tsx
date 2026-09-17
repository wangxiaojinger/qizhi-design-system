import { createRoot } from "react-dom/client";
import { LinkDocsIsland } from "./LinkDocsIsland";

const root = document.getElementById("components-link");
if (root) createRoot(root).render(<LinkDocsIsland />);

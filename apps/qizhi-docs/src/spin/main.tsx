import { createRoot } from "react-dom/client";
import { SpinDocsIsland } from "./SpinDocsIsland";

const root = document.getElementById("component-spin");
if (root) createRoot(root).render(<SpinDocsIsland />);

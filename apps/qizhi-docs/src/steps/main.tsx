import { createRoot } from "react-dom/client";
import { StepsDocsIsland } from "./StepsDocsIsland";

const root = document.getElementById("component-steps");
if (root) createRoot(root).render(<StepsDocsIsland />);

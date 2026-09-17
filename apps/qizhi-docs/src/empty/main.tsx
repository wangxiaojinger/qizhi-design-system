import { createRoot } from "react-dom/client";
import { EmptyDocsIsland } from "./EmptyDocsIsland";

const root = document.getElementById("component-empty");
if (root) createRoot(root).render(<EmptyDocsIsland />);

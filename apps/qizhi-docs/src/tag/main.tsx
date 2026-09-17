import { createRoot } from "react-dom/client";
import { TagDocsIsland } from "./TagDocsIsland";

const root = document.getElementById("component-tag");
if (root) createRoot(root).render(<TagDocsIsland />);

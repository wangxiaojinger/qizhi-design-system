import { createRoot } from "react-dom/client";
import { SkeletonDocsIsland } from "./SkeletonDocsIsland";

const root = document.getElementById("component-skeleton");
if (root) createRoot(root).render(<SkeletonDocsIsland />);

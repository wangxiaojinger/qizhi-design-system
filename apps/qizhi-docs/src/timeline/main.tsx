import { createRoot } from "react-dom/client";
import { TimelineDocsIsland } from "./TimelineDocsIsland";

const root = document.getElementById("component-timeline");
if (root) createRoot(root).render(<TimelineDocsIsland />);


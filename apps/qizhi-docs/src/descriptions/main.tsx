import { createRoot } from "react-dom/client";
import { DescriptionsDocsIsland } from "./DescriptionsDocsIsland";

const root = document.getElementById("component-descriptions");
if (root) createRoot(root).render(<DescriptionsDocsIsland />);

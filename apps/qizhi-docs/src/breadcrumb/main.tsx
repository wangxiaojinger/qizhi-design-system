import { createRoot } from "react-dom/client";
import { BreadcrumbDocsIsland } from "./BreadcrumbDocsIsland";

const root = document.getElementById("component-breadcrumb");
if (root) createRoot(root).render(<BreadcrumbDocsIsland />);

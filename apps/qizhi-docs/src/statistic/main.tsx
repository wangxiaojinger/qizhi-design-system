import { createRoot } from "react-dom/client";
import { StatisticDocsIsland } from "./StatisticDocsIsland";

const root = document.getElementById("component-statistic");
if (root) createRoot(root).render(<StatisticDocsIsland />);

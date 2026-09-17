import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@wangxiaojinger/qizhi-react/style.css";
import { App } from "./App";
import "./page.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

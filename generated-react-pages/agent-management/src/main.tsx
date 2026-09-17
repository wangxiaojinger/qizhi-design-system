import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@wangxiaojinger/qizhi-react/style.css";
import "./page.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);

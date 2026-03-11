import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import EOSReportApp from "../main.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EOSReportApp />
  </StrictMode>
);

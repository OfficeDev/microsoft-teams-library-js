import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./index.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root container not found");
}

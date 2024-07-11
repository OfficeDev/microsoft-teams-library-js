import React from "react";
import { createRoot } from "react-dom/client";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from "./components/App";
import "./index.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);

  root.render(
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  );
} else {
  console.error("Root container not found");
}

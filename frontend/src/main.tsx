import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./index.css";
import "@/store/adminStore"; // hydrates admin edits into the public catalogue before first render
import { QueryProvider } from "@/app/QueryProvider";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);

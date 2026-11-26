import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { URL } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { sourcemap: false, chunkSizeWarningLimit: 700 },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});

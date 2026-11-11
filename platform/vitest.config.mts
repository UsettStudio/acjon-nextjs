import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "server-only", replacement: path.resolve(import.meta.dirname, "test/server-only-stub.ts") },
      { find: /^@\/(.*)$/, replacement: path.resolve(import.meta.dirname, "src/$1") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "test/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});

/// <reference types="vitest/config" />
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  oxc: false,
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("jspdf")) {
              return "vendor-jspdf";
            }
            if (id.includes("html2canvas")) {
              return "vendor-html2canvas";
            }
            if (id.includes("jszip")) {
              return "vendor-jszip";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }
            if (id.includes("@tiptap")) {
              return "vendor-editor";
            }
            if (id.includes("@dnd-kit") || id.includes("@hello-pangea/dnd")) {
              return "vendor-dnd";
            }
            if (id.includes("dexie")) {
              return "vendor-db";
            }
            if (id.includes("lucide-react")) {
              return "lucide-icons";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
          }
        },
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: "./src/setupTests.ts",
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
}));

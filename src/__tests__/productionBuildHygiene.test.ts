import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Production Build Hygiene & Console Cleanup", () => {
  it("verifies vite.config.ts specifies dropping console and debugger statements in production", () => {
    const configPath = path.resolve(__dirname, "../../vite.config.ts");
    const content = fs.readFileSync(configPath, "utf8");

    // esbuild drop configuration
    expect(content).toContain("esbuild:");
    expect(content).toContain("drop: mode === \"production\" ? [\"console\", \"debugger\"] : []");
  });

  it("verifies manual chunk splitting isolates third-party vendor libraries", () => {
    const configPath = path.resolve(__dirname, "../../vite.config.ts");
    const content = fs.readFileSync(configPath, "utf8");

    expect(content).toContain("manualChunks");
    expect(content).toContain("lucide-react");
    expect(content).toContain("lucide-icons");
  });
});

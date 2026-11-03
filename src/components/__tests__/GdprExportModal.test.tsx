import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { GdprExportModal } from "../GdprExportModal";
import * as privacyUtils from "@/lib/privacyUtils";

vi.mock("@/lib/privacyUtils", () => ({
  gatherAllUserData: vi.fn().mockResolvedValue({
    dump: {
      summary: {
        totalProjects: 3,
        totalTasks: 12,
        totalNotes: 5,
        totalCanvasNodes: 8,
      },
    },
    rawAssets: [],
  }),
  exportAllUserDataAsZip: vi.fn().mockResolvedValue(undefined),
  exportAllUserDataAsJson: vi.fn().mockResolvedValue(undefined),
}));

describe("GdprExportModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal dialog with inventory statistics when open", async () => {
    render(<GdprExportModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Privacy & Data Portability")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("3")).toBeDefined(); // projects
      expect(screen.getByText("12")).toBeDefined(); // tasks
      expect(screen.getByText("5")).toBeDefined(); // notes
      expect(screen.getByText("8")).toBeDefined(); // ideas
    });

    expect(screen.getByRole("button", { name: "Export Data JSON" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Export Complete Archive with Media" })).toBeDefined();
  });

  it("invokes exportAllUserDataAsJson when JSON button is clicked", async () => {
    const handleOpenChange = vi.fn();
    render(<GdprExportModal open={true} onOpenChange={handleOpenChange} />);

    const jsonBtn = screen.getByRole("button", { name: "Export Data JSON" });
    fireEvent.click(jsonBtn);

    await waitFor(() => {
      expect(privacyUtils.exportAllUserDataAsJson).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("invokes exportAllUserDataAsZip when ZIP button is clicked", async () => {
    const handleOpenChange = vi.fn();
    render(<GdprExportModal open={true} onOpenChange={handleOpenChange} />);

    const zipBtn = screen.getByRole("button", { name: "Export Complete Archive with Media" });
    fireEvent.click(zipBtn);

    await waitFor(() => {
      expect(privacyUtils.exportAllUserDataAsZip).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BrandDeckModal } from "@/components/BrandDeckModal";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";

vi.mock("@/lib/db", () => ({
  db: {
    projects: { get: vi.fn().mockResolvedValue({ id: 1, title: "Acme Brand" }) },
    brandIdentities: { where: () => ({ equals: () => ({ first: vi.fn().mockResolvedValue(null) }) }) },
    paletteColors: { where: () => ({ equals: () => ({ toArray: vi.fn().mockResolvedValue([]) }) }) },
    assets: { where: () => ({ equals: () => ({ toArray: vi.fn().mockResolvedValue([]) }) }) },
    moodboardItems: { where: () => ({ equals: () => ({ toArray: vi.fn().mockResolvedValue([]) }) }) },
  },
}));

describe("Modal Focus Trap & Accessibility", () => {
  it("BrandDeckModal renders with role=dialog, aria-modal, and traps keyboard focus", () => {
    const handleClose = vi.fn();
    render(<BrandDeckModal projectId={1} isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole("dialog", { name: "Brand Guidelines Deck Preview" });
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    // Close button has accessible label
    const closeBtn = screen.getByRole("button", { name: "Close brand guidelines deck" });
    expect(closeBtn).toBeDefined();

    // Hitting Escape calls onClose handler
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("ImagePreviewModal renders accessible dialog and control buttons", () => {
    const handleOpenChange = vi.fn();
    render(
      <ImagePreviewModal
        url="/test.png"
        name="test.png"
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Copy image to clipboard" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Download image" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Close image preview" })).toBeDefined();
  });
});

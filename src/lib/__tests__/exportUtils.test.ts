import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadBlob, downloadDataUrl } from "../exportUtils";

describe("exportUtils", () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = {
        tagName,
        href: "",
        download: "",
        click: clickSpy,
        style: {}
      } as unknown as HTMLElement;
      return el;
    });

    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    // Mock URL methods
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadBlob", () => {
    it("creates an object URL, clicks anchor, and revokes URL", () => {
      const blob = new Blob(["test-data"], { type: "text/plain" });
      downloadBlob(blob, "export.txt");

      expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("downloadDataUrl", () => {
    it("creates an anchor with data URL, triggers click, and removes it", () => {
      const dataUrl = "data:image/png;base64,mockpngdata";
      downloadDataUrl(dataUrl, "snapshot.png");

      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});

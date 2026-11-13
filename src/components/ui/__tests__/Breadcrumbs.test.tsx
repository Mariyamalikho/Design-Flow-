import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumbs } from "../Breadcrumbs";

describe("Breadcrumbs Component", () => {
  it("renders breadcrumb list with schema.org microdata", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Acme Rebrand" },
          ]}
        />
      </MemoryRouter>
    );

    const nav = screen.getByRole("navigation", { name: /breadcrumbs/i });
    expect(nav).toBeDefined();

    // Check schema itemType
    const ol = nav.querySelector("ol");
    expect(ol?.getAttribute("itemtype")).toBe("https://schema.org/BreadcrumbList");

    // Check links and current page
    expect(screen.getByText("Workspace")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Acme Rebrand")).toBeDefined();

    const currentItem = screen.getByText("Acme Rebrand");
    expect(currentItem.getAttribute("aria-current")).toBe("page");
  });

  it("supports hiding root home item", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          showHome={false}
          items={[{ label: "Moodboard Studio" }]}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText("Workspace")).toBeNull();
    expect(screen.getByText("Moodboard Studio")).toBeDefined();
  });
});

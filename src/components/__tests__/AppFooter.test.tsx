import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AppFooter } from "../AppFooter";
import { useAppStore } from "@/store/useAppStore";

describe("AppFooter Component", () => {
  it("renders studio navigation links and architecture details", () => {
    render(
      <MemoryRouter>
        <AppFooter />
      </MemoryRouter>
    );

    // Semantic landmark
    const footer = screen.getByRole("contentinfo", { name: /designflow studio footer/i });
    expect(footer).toBeDefined();

    // Studio links
    expect(screen.getByText("Brand Identity Studio")).toBeDefined();
    expect(screen.getByText("Visual Moodboard Studio")).toBeDefined();
    expect(screen.getByText("Brainstorm Canvas")).toBeDefined();
    expect(screen.getByText("Projects Directory")).toBeDefined();

    // System files & sitemaps
    expect(screen.getByText("XML Sitemap")).toBeDefined();
    expect(screen.getByText("Robots Directive")).toBeDefined();
    expect(screen.getByText("Local-First Offline Ready")).toBeDefined();
  });

  it("triggers GDPR and onboarding modals from footer actions", () => {
    useAppStore.setState({ isGdprModalOpen: false, isOnboardingModalOpen: false });

    render(
      <MemoryRouter>
        <AppFooter />
      </MemoryRouter>
    );

    const gdprBtn = screen.getByText("GDPR Data Export");
    fireEvent.click(gdprBtn);
    expect(useAppStore.getState().isGdprModalOpen).toBe(true);

    const tourBtn = screen.getByText("Interactive Tour");
    fireEvent.click(tourBtn);
    expect(useAppStore.getState().isOnboardingModalOpen).toBe(true);
  });
});

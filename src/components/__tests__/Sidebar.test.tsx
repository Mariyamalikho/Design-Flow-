import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { useAppStore } from "@/store/useAppStore";

describe("Sidebar Navigation Component & Micro-Animations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ isSidebarOpen: false });
  });

  const renderSidebar = (initialRoute = "/") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it("renders brand header and all workspace navigation links", () => {
    renderSidebar();

    expect(screen.getAllByText("DesignFlow").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Task Board").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brainstorm Canvas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Design Briefs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Moodboards").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brand Identity").length).toBeGreaterThan(0);
  });

  it("displays glowing active indicator on current route", () => {
    renderSidebar("/projects");

    const activeIndicators = screen.getAllByTestId("sidebar-active-indicator");
    expect(activeIndicators.length).toBeGreaterThan(0);
  });

  it("triggers onboarding modal when Quick Welcome Tour button is clicked", () => {
    const setOnboardingModalOpenSpy = vi.fn();
    useAppStore.setState({ setOnboardingModalOpen: setOnboardingModalOpenSpy });

    renderSidebar();

    const tourButtons = screen.getAllByTestId("sidebar-welcome-tour-button");
    expect(tourButtons.length).toBeGreaterThan(0);

    fireEvent.click(tourButtons[0]);
    expect(setOnboardingModalOpenSpy).toHaveBeenCalledWith(true);
  });

  it("triggers GDPR export modal when Privacy & Data Export button is clicked", () => {
    const setGdprModalOpenSpy = vi.fn();
    useAppStore.setState({ setGdprModalOpen: setGdprModalOpenSpy });

    renderSidebar();

    const gdprButtons = screen.getAllByTestId("sidebar-gdpr-export-button");
    expect(gdprButtons.length).toBeGreaterThan(0);

    fireEvent.click(gdprButtons[0]);
    expect(setGdprModalOpenSpy).toHaveBeenCalledWith(true);
  });

  it("controls mobile drawer visibility based on isSidebarOpen state", () => {
    useAppStore.setState({ isSidebarOpen: false });
    const { rerender } = renderSidebar();

    expect(screen.queryByTestId("sidebar-mobile-backdrop")).not.toBeInTheDocument();
    const mobileDrawer = screen.getByTestId("sidebar-mobile-drawer");
    expect(mobileDrawer).toHaveClass("-translate-x-full");

    // Open mobile sidebar
    act(() => {
      useAppStore.setState({ isSidebarOpen: true });
    });
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByTestId("sidebar-mobile-backdrop")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-mobile-drawer")).toHaveClass("translate-x-0");

    // Click close button
    const closeBtn = screen.getByTestId("sidebar-mobile-close-button");
    fireEvent.click(closeBtn);
    expect(useAppStore.getState().isSidebarOpen).toBe(false);
  });

  it("closes mobile sidebar when mobile backdrop is clicked", () => {
    useAppStore.setState({ isSidebarOpen: true });
    renderSidebar();

    const backdrop = screen.getByTestId("sidebar-mobile-backdrop");
    fireEvent.click(backdrop);

    expect(useAppStore.getState().isSidebarOpen).toBe(false);
  });
});

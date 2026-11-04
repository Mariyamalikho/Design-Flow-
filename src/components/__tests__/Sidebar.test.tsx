import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { useAppStore } from "@/store/useAppStore";

describe("Sidebar Navigation Component & Micro-Animations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(screen.getByText("DesignFlow")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Task Board")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Brainstorm Canvas")).toBeInTheDocument();
    expect(screen.getByText("Design Briefs")).toBeInTheDocument();
    expect(screen.getByText("Moodboards")).toBeInTheDocument();
    expect(screen.getByText("Brand Identity")).toBeInTheDocument();
  });

  it("displays glowing active indicator on current route", () => {
    renderSidebar("/projects");

    const activeIndicator = screen.getByTestId("sidebar-active-indicator");
    expect(activeIndicator).toBeInTheDocument();
  });

  it("triggers onboarding modal when Quick Welcome Tour button is clicked", () => {
    const setOnboardingModalOpenSpy = vi.fn();
    useAppStore.setState({ setOnboardingModalOpen: setOnboardingModalOpenSpy });

    renderSidebar();

    const tourButton = screen.getByTestId("sidebar-welcome-tour-button");
    expect(tourButton).toBeInTheDocument();

    fireEvent.click(tourButton);
    expect(setOnboardingModalOpenSpy).toHaveBeenCalledWith(true);
  });

  it("triggers GDPR export modal when Privacy & Data Export button is clicked", () => {
    const setGdprModalOpenSpy = vi.fn();
    useAppStore.setState({ setGdprModalOpen: setGdprModalOpenSpy });

    renderSidebar();

    const gdprButton = screen.getByTestId("sidebar-gdpr-export-button");
    expect(gdprButton).toBeInTheDocument();

    fireEvent.click(gdprButton);
    expect(setGdprModalOpenSpy).toHaveBeenCalledWith(true);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TopNav } from "../TopNav";
import { useAppStore } from "@/store/useAppStore";

describe("TopNav", () => {
  beforeEach(() => {
    useAppStore.setState({ isCommandPaletteOpen: false, theme: "light" });
  });

  it("renders search button with Cmd+K badge", () => {
    render(<TopNav />);

    const searchBtn = screen.getByTestId("topnav-search-button");
    expect(searchBtn).toBeDefined();
    expect(screen.getByText("Search projects, tasks, or tags...")).toBeDefined();
    expect(screen.getByText("K")).toBeDefined();
  });

  it("opens command palette when clicking search bar", () => {
    render(<TopNav />);

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);

    const searchBtn = screen.getByTestId("topnav-search-button");
    fireEvent.click(searchBtn);

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
  });

  it("toggles theme between light and dark when theme button is clicked", () => {
    render(<TopNav />);

    expect(useAppStore.getState().theme).toBe("light");

    const themeBtn = screen.getByTitle("Toggle light and dark theme");
    fireEvent.click(themeBtn);

    expect(useAppStore.getState().theme).toBe("dark");

    fireEvent.click(themeBtn);
    expect(useAppStore.getState().theme).toBe("light");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import BrandIdentity from "../BrandIdentity";
import type { Project } from "@/lib/db";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: undefined }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock TypographyManager component to isolate page behavior
vi.mock("@/components/TypographyManager", () => ({
  TypographyManager: ({ projectId }: { projectId: number }) => (
    <div data-testid="mock-typography-manager" data-project-id={projectId}>
      Mock Typography Manager for Project {projectId}
    </div>
  ),
}));

let mockProjectsList: Project[] = [];

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (queryFn: any) => {
    return mockProjectsList;
  },
}));

describe("BrandIdentity Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjectsList = [
      {
        id: 1,
        title: "Mobile App Redesign",
        description: "New UX/UI design",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "Brand Refresh",
        description: "Brand guidelines and identity",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  });

  it("renders Brand Identity Studio header and active project typography manager", () => {
    render(<BrandIdentity />);

    expect(screen.getByRole("heading", { name: "Brand Identity Studio", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Define typography pairings/i)).toBeInTheDocument();

    const manager = screen.getByTestId("mock-typography-manager");
    expect(manager).toBeInTheDocument();
    expect(manager.getAttribute("data-project-id")).toBe("1");
  });

  it("switches project when project dropdown changes", () => {
    render(<BrandIdentity />);

    const select = screen.getByLabelText("Select project for brand identity");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "2" } });
    expect(mockNavigate).toHaveBeenCalledWith("/identity/2", { replace: true });
  });

  it("renders empty state when no projects exist", () => {
    mockProjectsList = [];
    render(<BrandIdentity />);

    expect(screen.getByText("No projects found")).toBeInTheDocument();
    expect(screen.getByText("Initialize Architectural Project")).toBeInTheDocument();
    expect(screen.getByText("Blank Project")).toBeInTheDocument();
  });
});

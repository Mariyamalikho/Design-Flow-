import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Moodboards from "../Moodboards";
import type { Project } from "@/lib/db";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useParams: () => ({ projectId: undefined }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock Moodboard component to isolate page behavior
vi.mock("@/components/Moodboard", () => ({
  Moodboard: ({ projectId }: { projectId: number }) => (
    <div data-testid="mock-moodboard" data-project-id={projectId}>
      Mock Moodboard for Project {projectId}
    </div>
  ),
}));

let mockProjectsList: Project[] = [];

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (queryFn: any) => {
    return mockProjectsList;
  },
}));

describe("Moodboards Page", () => {
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

  it("renders Moodboard Studio header and active project moodboard", () => {
    render(<Moodboards />);

    expect(screen.getByRole("heading", { name: "Moodboard Studio", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Curate visual inspiration/i)).toBeInTheDocument();

    const moodboard = screen.getByTestId("mock-moodboard");
    expect(moodboard).toBeInTheDocument();
    expect(moodboard.getAttribute("data-project-id")).toBe("1");
  });

  it("switches project when project dropdown changes", () => {
    render(<Moodboards />);

    const select = screen.getByLabelText("Select project for moodboard");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "2" } });
    expect(mockNavigate).toHaveBeenCalledWith("/moodboards/2", { replace: true });
  });

  it("renders empty state when no projects exist", () => {
    mockProjectsList = [];
    render(<Moodboards />);

    expect(screen.getByText("No projects found")).toBeInTheDocument();
    expect(screen.getByText("Initialize Architectural Project")).toBeInTheDocument();
    expect(screen.getByText("Blank Project")).toBeInTheDocument();
  });
});

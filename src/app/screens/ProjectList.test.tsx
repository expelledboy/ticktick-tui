import { describe, test, expect, beforeEach } from "bun:test";
import { ProjectList } from "./ProjectList";
import { setupTestData } from "../../../tests/utils";
import { createTestHelper, waitForCondition } from "../../../tests/testhelper";
import { useAppStore } from "../../store";
import { mockState } from "../../ticktick/api.mock";
import { mock } from "bun:test";

describe("ProjectList", () => {
  beforeEach(() => {
    // Reset mocks and app state before each test
    setupTestData();
    useAppStore.getState().setError(null);
  });

  test("renders empty state when no projects exist", async () => {
    // Render the component with empty data
    const app = createTestHelper(<ProjectList />);

    // Wait for the initial render
    await app.ui.viewRendered("ProjectList");

    // Verify the empty state message
    await waitForCondition(() => app.lastFrame().includes("No projects found"));
  });

  test("displays projects sorted by sortOrder", async () => {
    // Set up test data with projects in a specific order
    setupTestData([
      { id: "project-1", name: "Project B", sortOrder: 2 },
      { id: "project-2", name: "Project A", sortOrder: 1 },
      { id: "project-3", name: "Project C", sortOrder: 3 },
    ]);

    // Render the component
    const app = createTestHelper(<ProjectList />);

    // Wait for data to load
    await waitForCondition(() => app.lastFrame().includes("Project A"));

    // Get the final rendered output
    const frame = app.ui.createSnapshot();

    // Check that projects are ordered correctly
    const projectAIndex = frame.indexOf("Project A");
    const projectBIndex = frame.indexOf("Project B");
    const projectCIndex = frame.indexOf("Project C");

    expect(projectAIndex).toBeGreaterThan(-1);
    expect(projectBIndex).toBeGreaterThan(-1);
    expect(projectCIndex).toBeGreaterThan(-1);
    expect(projectAIndex).toBeLessThan(projectBIndex);
    expect(projectBIndex).toBeLessThan(projectCIndex);
  });

  test("allows navigation between projects", async () => {
    // Set the active view to projects
    useAppStore.getState().setActiveView("projects");

    // Set up test data
    setupTestData([
      { id: "project-1", name: "Project 1", sortOrder: 1 },
      { id: "project-2", name: "Project 2", sortOrder: 2 },
    ]);

    // Render the component
    const app = createTestHelper(<ProjectList />);

    // Wait for data to load
    await waitForCondition(() => app.lastFrame().includes("Project 1"));

    // Initially, the first project should be selected
    const frame1 = app.ui.createSnapshot();
    expect(frame1).toContain("›  Project 1");

    // Press down to move to the second project
    await app.press("down");

    console.log("activeView", useAppStore.getState().activeView);

    // Wait for the UI to update with enhanced error context
    await waitForCondition(() => app.lastFrame().includes("›  Project 2"));

    // Verify second project is now selected
    const frame2 = app.ui.createSnapshot();
    expect(frame2).toContain("›  Project 2");
  });

  test("displays loading state before data is available", async () => {
    // We can simulate a slow response by not adding any projects initially
    const app = createTestHelper(<ProjectList />);

    // Verify loading state is shown
    const initialFrame = app.lastFrame();
    expect(initialFrame).toContain("Loading");

    // Add projects later
    setupTestData([{ id: "project-1", name: "Project 1", sortOrder: 1 }]);

    // Wait for the projects to load
    await waitForCondition(() => app.lastFrame().includes("Project 1"));

    // Verify loading message is gone and project is displayed
    const finalFrame = app.lastFrame();
    expect(finalFrame).not.toContain("Loading");
    expect(finalFrame).toContain("Project 1");
  });

  test("handles errors when fetching projects", async () => {
    // Mock the getAllProjects function of mockState to throw an error
    const originalGetAllProjects = mockState.getAllProjects;
    const errorMessage = "Failed to fetch projects";

    const mockGetAllProjects = mock(() => {
      throw new Error(errorMessage);
    });

    // Apply the mock
    mockState.getAllProjects = mockGetAllProjects;

    try {
      // Render the component
      const app = createTestHelper(<ProjectList />);

      // Wait for React Query to process the error and reach error state
      await waitForCondition(() => app.lastFrame().includes("Error"));

      // Verify the mock was called
      expect(mockGetAllProjects).toHaveBeenCalled();

      // Verify either the app state error or UI error message
      const appError = useAppStore.getState().error;

      // Check for error in app state
      if (appError !== null) {
        expect(appError).toContain(errorMessage);
      }

      // Check for error in UI
      const output = app.lastFrame();
      expect(output).toContain("Error"); // Check for Error header
      expect(output).toContain(errorMessage); // Check for error message content
    } finally {
      // Restore the original implementation
      mockState.getAllProjects = originalGetAllProjects;
    }
  });
});

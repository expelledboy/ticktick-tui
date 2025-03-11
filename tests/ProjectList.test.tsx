import React from "react";
import { describe, test, expect, beforeEach } from "bun:test";
import { ProjectList } from "../src/app/screens/ProjectList";
import { createTestHelper, setupTestData, stripAnsi } from "./utils";
import { useAppStore } from "../src/store";
import { mockState } from "../src/ticktick/api.mock";
import { mock } from "bun:test";

describe("ProjectList", () => {
  beforeEach(() => {
    // Reset mocks and app state before each test
    setupTestData();
    useAppStore.getState().setError(null);
  });

  test("renders empty state when no projects exist", async () => {
    // Render the component with empty data
    const helper = createTestHelper(<ProjectList />);

    // Wait for the initial render
    await helper.waitForText("No projects found");

    // Verify the empty state message
    const frame = helper.lastFrame();
    expect(frame).toBeTruthy();
    expect(frame).toContain("No projects found");
  });

  test("displays projects sorted by sortOrder", async () => {
    // Set up test data with projects in a specific order
    setupTestData([
      { id: "project-1", name: "Project B", sortOrder: 2 },
      { id: "project-2", name: "Project A", sortOrder: 1 },
      { id: "project-3", name: "Project C", sortOrder: 3 },
    ]);

    // Render the component
    const helper = createTestHelper(<ProjectList />);

    // Wait for data to load
    await helper.waitForText("Project A");

    // Get the final rendered output (now auto-stripped of ANSI codes)
    const output = helper.lastFrame();

    // Check that projects are ordered correctly
    const projectAIndex = output.indexOf("Project A");
    const projectBIndex = output.indexOf("Project B");
    const projectCIndex = output.indexOf("Project C");

    expect(projectAIndex).toBeGreaterThan(-1);
    expect(projectBIndex).toBeGreaterThan(-1);
    expect(projectCIndex).toBeGreaterThan(-1);
    expect(projectAIndex).toBeLessThan(projectBIndex);
    expect(projectBIndex).toBeLessThan(projectCIndex);
  });

  test("allows navigation between projects", async () => {
    // Set up test data
    setupTestData([
      { id: "project-1", name: "Project 1", sortOrder: 1 },
      { id: "project-2", name: "Project 2", sortOrder: 2 },
    ]);

    // Render the component
    const helper = createTestHelper(<ProjectList />);

    // Wait for data to load
    await helper.waitForText("Project 1");

    // Initially, the first project should be selected
    // Based on error output, we need to look for the › character instead of >
    const output = helper.lastFrame();
    expect(output).toContain("›  Project 1");

    // Press down to move to the second project
    helper.press("down");

    // Wait for the UI to update
    await helper.waitForCondition(() => {
      return helper.lastFrame().includes("›  Project 2");
    });

    // Verify second project is now selected
    const finalOutput = helper.lastFrame();
    expect(finalOutput).toBeTruthy();
    expect(finalOutput).toContain("›  Project 2");
  });

  test("displays loading state before data is available", async () => {
    // We can simulate a slow response by not adding any projects initially
    const helper = createTestHelper(<ProjectList />);

    // Verify loading state is shown
    const initialFrame = helper.lastFrame();
    expect(initialFrame).toBeTruthy();
    expect(initialFrame).toContain("Loading");

    // Add projects later
    setupTestData([{ id: "project-1", name: "Project 1", sortOrder: 1 }]);

    // Wait for the projects to load
    await helper.waitForText("Project 1");

    // Verify loading message is gone and project is displayed
    const finalOutput = helper.lastFrame();
    expect(finalOutput).not.toContain("Loading");
    expect(finalOutput).toContain("Project 1");
  });

  test("handles errors when fetching projects", async () => {
    // Mock the getAllProjects function of mockState to throw an error
    // This will affect the api.getProjects function used by the component
    const originalGetAllProjects = mockState.getAllProjects;
    const errorMessage = "Failed to fetch projects";

    const mockGetAllProjects = mock(() => {
      throw new Error(errorMessage);
    });

    // Apply the mock
    mockState.getAllProjects = mockGetAllProjects;

    try {
      // Render the component
      const helper = createTestHelper(<ProjectList />);

      // Wait for React Query to process the error and reach error state
      // This is more reliable than using an arbitrary timeout
      await helper.waitForQueryStatus(["projects"], "error");

      // Verify the mock was called
      expect(mockGetAllProjects).toHaveBeenCalled();

      // Verify either the app state error or UI error message
      const appError = useAppStore.getState().error;
      const output = stripAnsi(helper.lastFrame() || "");

      // Check for error in app state
      if (appError !== null) {
        expect(appError).toContain(errorMessage);
      }

      // Check for error in UI
      expect(output).toContain("Error: " + errorMessage);
    } finally {
      // Restore the original implementation
      mockState.getAllProjects = originalGetAllProjects;
    }
  });
});

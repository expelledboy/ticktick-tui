/**
 * End-to-end tests for the TickTick TUI application
 */
import { test, beforeAll } from "bun:test";
import { App } from "../src/app/App";
import { createTestHelper } from "./testhelper";
import { setupTestData } from "./utils";
import { useAppStore } from "../src/store";
import { QUERY_KEYS } from "../src/ticktick/useReactQuery";

// Global state
let app: ReturnType<typeof createTestHelper>;

// XXX: This is an e2e test, so state is shared across tests
beforeAll(() => {
  app = createTestHelper(<App />);

  // Reset the app state
  useAppStore.getState().reset();

  // XXX: ONLY setup the state at the start of the test suite
  setupTestData(
    [
      {
        id: "project-1",
        name: "Project 1",
        sortOrder: 1,
      },
      {
        id: "project-2",
        name: "Project 2",
        sortOrder: 2,
      },
    ],
    [
      {
        id: "task-1",
        title: "Task 1",
        projectId: "project-1",
        sortOrder: 2,
      },
      {
        id: "task-2",
        title: "Task 2",
        projectId: "project-1",
        sortOrder: 1,
      },
    ]
  );
});

test("app renders on open", async () => {
  await app.query.waitForQueryStatus(QUERY_KEYS.projects.all, "success");

  app.ui.createSnapshot();
  app.ui.contains("Projects");
  app.ui.contains("Project 1");
  app.ui.contains("Project 2");
});

test("can navigate between projects", async () => {
  await app.user
    .does(app.user.press("down"))
    .sees("focuses on project 2 in the list", () => {
      app.ui.contains("›  Project 2");
    });

  await app.user
    .does(app.user.press("up"))
    .sees("focuses on project 1 in the list", () => {
      app.ui.contains("›  Project 1");
    });
});

test("can select a project", async () => {
  await app.user
    .does(
      // Wait for both data to load and UI to update
      app.user
        .press("return")
        .then(() =>
          app.query.waitForQueryStatus(
            QUERY_KEYS.projects.data("project-1"),
            "success"
          )
        )
        .then(() => app.ui.viewRendered("ProjectList"))
    )
    .sees("project 1 is selected and its tasks are visible", () => {
      // This project should be selected and visible
      app.ui.contains("›  Project 1");
      // Tasks should be loaded and visible
      app.ui.contains("Task 1");
    });
});

test.skip("can scroll through tasks (without affecting project list)", async () => {
  await app.user
    .does(app.user.press("down"))
    .sees("focuses on task 2 in the list", () => {
      // Task 2 should be focused
      app.ui.contains("› ☐ Task 2");
    });

  // Should still show current project
  app.ui.contains("›  Project 1");
});

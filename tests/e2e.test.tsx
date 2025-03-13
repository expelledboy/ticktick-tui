/**
 * End-to-end tests for the TickTick TUI application
 */
import { describe, test, beforeAll } from "bun:test";
import { App } from "../src/app/App";
import { createTestHelper } from "./testhelper";
import { setupTestData } from "./utils";
import { useAppStore } from "../src/store";
import { QUERY_KEYS } from "../src/ticktick/useReactQuery";

describe("Project and Task Management E2E", () => {
  // Global state
  let app: ReturnType<typeof createTestHelper>;

  // XXX: This is an e2e test, so state is shared across tests
  //      Also do NOT use mockState, as we want to test e2e
  beforeAll(() => {
    app = createTestHelper(<App />);

    // Reset the app state
    useAppStore.getState().reset();

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
    await app.user
      .does(
        "opens the app",
        app.waitForQueryStatus(QUERY_KEYS.projects.all, "success")
      )
      .sees(() => {
        app.ui.contains("Projects");
        app.ui.contains("Project 1");
        app.ui.contains("Project 2");
        app.logs.contains("KEYBINDING", { action: /loaded/ });
      });
  });

  test("can navigate between projects", async () => {
    await app.user
      .does(
        "navigates to project 2",
        (async () => {
          await app.press("down");
          // Wait for UI to update - this is simple and effective
          await app.waitForText("›  Project 2");
        })()
      )
      .sees(() => {
        app.ui.contains("›  Project 2");
        app.logs.contains("KEYBINDING_TRIGGERED", { action: /down/ });
      });

    await app.user
      .does(
        "navigate back to project 1",
        (async () => {
          await app.press("up");
          // Wait for UI to update
          await app.waitForText("›  Project 1");
        })()
      )
      .sees(() => {
        app.ui.contains("›  Project 1");
        app.logs.contains("KEYBINDING_TRIGGERED", { action: /up/ });
      });
  });

  test("can select a project", async () => {
    await app.user
      .does(
        "selects project 1",
        (async () => {
          await app.press("enter");

          // Wait for both data to load and UI to update
          await app.waitForQueryStatus(
            QUERY_KEYS.projects.data("project-1"),
            "success"
          );

          // Check that task data is visible in the UI
          await app.waitForText("Task 1");
        })()
      )
      .sees(() => {
        app.logs.contains("KEYBINDING_TRIGGERED", { action: /select/ });
        // This project should be selected and visible
        app.ui.contains("›  Project 1");
        // Tasks should be loaded and visible
        app.ui.contains("Task 1");
      });
  });

  test("can scroll through tasks (without affecting project list)", async () => {
    await app.user
      .does(
        "scrolls through tasks",
        (async () => {
          await app.press("down");
          // Wait for UI to update to show the focused task
          await app.waitForText("› ☐ Task 2");
        })()
      )
      .sees(() => {
        // Should show current project
        app.ui.contains("›  Project 1");
        // Task 2 should be focused
        app.ui.contains("› ☐ Task 2");
        app.logs.contains("KEYBINDING_TRIGGERED", { action: /down/ });
      });
  });
});

/**
 * End-to-end tests for the TickTick TUI application
 */
import { describe, test, beforeAll } from "bun:test";
import { App } from "../src/app/App";
import { createTestHelper } from "./testhelper";

describe("Project and Task Management E2E", () => {
  // Global state
  let app: ReturnType<typeof createTestHelper>;

  // XXX: This is an e2e test, so state is shared across tests
  //      Also do NOT use mockState, as we want to test e2e
  beforeAll(() => {
    app = createTestHelper(<App />);
  });

  test("app renders on open", async () => {
    await app.user
      .does("opens the app", app.waitForQueryStatus(["projects"], "success"))
      .sees(() => {
        app.ui.contains("Projects");
        app.ui.contains("No projects found");
        app.ui.contains("No project selected");

        app.logs.contains("KEYBINDING", { action: /loaded/ });
      });
  });

  test("can create a project", async () => {
    await app.user
      .does(
        "creates a project",
        (async () => {
          app.press("n");
          // await app.waitForLogOperation("FORM_CREATED", {
          //   title: /Project Details/,
          // });
        })()
      )
      .sees(() => {
        app.logs.contains("KEYBINDING_TRIGGERED", {
          category: /projects/,
          action: /newProject/,
        });
      });
  });
});

import { describe, test, expect, beforeEach } from "bun:test";
import { setupTestData } from "../../tests/utils";
import { createTestHelper, waitForCondition } from "../../tests/testhelper";
import { useAppStore } from "../store";
import { App, byeMsg } from "./App";
import { DEBUG } from "../constants";

// NOTE: Should only be testing the very high level functionality
//       Do more focused tests in the respective screen test files

describe("App", () => {
  let app: ReturnType<typeof createTestHelper>;

  beforeEach(async () => {
    // Reset mocks and app state before each test
    const aProject = { id: "project-1", name: "MyProject" };
    setupTestData([aProject]);
    useAppStore.getState().reset();
    app = createTestHelper(<App />);
    await app.query.waitForQueryStatus(["projects"], "success");
  });

  test("renders the app", async () => {
    expect(app.lastFrame()).toContain("MyProject");
  });

  test("toggle projects panel", async () => {
    await app.press("ctrl_p");

    expect(app.lastFrame()).not.toContain("MyProject");
  });

  // TODO: When we disable logs by default this will fail
  test("toggle logs panel", async () => {
    const logsPanelVisibleFlagged = () => {
      const frame = app.lastFrame();
      const includesLogs = frame.includes("Application Logs");
      return DEBUG ? !includesLogs : includesLogs;
    };

    expect(logsPanelVisibleFlagged()).toBe(false);

    await app.press("ctrl_l");

    expect(logsPanelVisibleFlagged()).toBe(true);
  });

  test("toggle debug panel", async () => {
    await app.press("ctrl_d");

    await waitForCondition(() =>
      app.lastFrame().includes("Debug (Developer Tool)")
    );
  });

  test("toggle help panel", async () => {
    await app.press("?");

    await waitForCondition(() => app.lastFrame().includes("NAVIGATION"));
  });

  test("quit application", async () => {
    await app.press("q");

    await waitForCondition(() => app.lastFrame().includes(byeMsg));
  });
});

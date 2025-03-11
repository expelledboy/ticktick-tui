import React from "react";
import { render } from "ink-testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockState } from "../src/ticktick/api.mock";
import type { Project, Task } from "../src/core/types";

/**
 * Strip ANSI escape codes (colors, formatting) from terminal output
 */
export function stripAnsi(text: string | undefined): string {
  if (!text) return "";

  // This regex matches all ANSI escape sequences
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

/**
 * Create a QueryClient configured for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
}

/**
 * Render an Ink component wrapped with a React Query provider
 */
export function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();

  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );

  return {
    ...result,
    queryClient,
  };
}

/**
 * Wait for a specific text to appear in the output
 */
export async function waitForText(
  getOutput: () => string,
  text: string,
  timeout = 3000
): Promise<void> {
  const startTime = Date.now();
  let lastOutput = "";

  while (Date.now() - startTime < timeout) {
    const output = getOutput();
    lastOutput = output || "";

    // Strip ANSI codes before checking for text
    const strippedOutput = stripAnsi(output || "");

    if (strippedOutput.includes(text)) {
      return;
    }

    // Try a less strict check for partial matches
    // This can be helpful for finding error messages where the format might vary
    if (text.includes(":") && text.split(":").length > 1) {
      const [prefix, message] = text.split(":", 2);
      if (
        strippedOutput.includes(prefix) &&
        strippedOutput.includes(message.trim())
      ) {
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // When timeout occurs, provide the actual content for debugging
  const strippedOutput = stripAnsi(lastOutput);
  console.error("Timeout waiting for text. Current content:");
  console.error(`Expected: "${text}"`);
  console.error(
    `Actual content (${strippedOutput.length} chars):\n"${strippedOutput}"`
  );

  throw new Error(`Timeout: Text "${text}" not found within ${timeout}ms`);
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 3000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Timeout: Condition not met within ${timeout}ms`);
}

/**
 * Simulate key presses in the terminal
 */
export function press(stdin: { write: (input: string) => void }, key: string) {
  const keyMap: Record<string, string> = {
    up: "\u001B[A",
    down: "\u001B[B",
    left: "\u001B[D",
    right: "\u001B[C",
    enter: "\r",
    escape: "\u001B",
    space: " ",
    tab: "\t",
    backspace: "\b",
    delete: "\u007F",
  };

  if (key in keyMap) {
    stdin.write(keyMap[key]);
  } else {
    stdin.write(key);
  }
}

/**
 * Type a string in the terminal
 */
export function typeText(
  stdin: { write: (input: string) => void },
  text: string
) {
  for (const char of text) {
    stdin.write(char);
  }
}

/**
 * Add test data to the mock API
 */
export function setupTestData(
  projects: Array<Partial<Project> & { id: string; name: string }> = [],
  tasks: Array<
    Partial<Task> & { id: string; projectId: string; title: string }
  > = []
) {
  // Reset the mock state
  mockState.reset();

  // Add projects
  projects.forEach((project) => {
    mockState.addProject(project as Project);
  });

  // Add tasks
  tasks.forEach((task) => {
    mockState.addTask(task as Task);
  });
}

/**
 * Create a test helper for working with specific components
 */
export function createTestHelper(ui: React.ReactElement) {
  const result = renderWithQuery(ui);

  return {
    // Add a clean version of lastFrame that strips ANSI codes
    lastFrame: () => {
      const frame = result.lastFrame();
      return frame ? stripAnsi(frame) : "";
    },

    // Keep the original frame with ANSI codes
    rawFrame: result.lastFrame,

    // Access to the querClient for advanced testing
    queryClient: result.queryClient,

    // Helper methods for waiting
    waitForText: (text: string, timeout?: number) =>
      waitForText(() => result.lastFrame() || "", text, timeout),

    waitForCondition: (condition: () => boolean, timeout?: number) =>
      waitForCondition(condition, timeout),

    // Add a method to wait for query status
    waitForQueryStatus: (
      queryKey: any[],
      status: "error" | "success" | "loading",
      timeout?: number
    ) => waitForQueryStatus(result.queryClient, queryKey, status, timeout),

    // Input helpers
    press: (key: string) => press(result.stdin, key),

    type: (text: string) => typeText(result.stdin, text),

    // Cleanup method
    unmount: result.unmount,

    // Expose any other needed properties from result
    frames: result.frames,
    stdin: result.stdin,
  };
}

/**
 * Wait for a specific query status (success, error, loading)
 * This is more reliable than using setTimeout in tests
 */
export async function waitForQueryStatus(
  queryClient: QueryClient,
  queryKey: any[],
  status: "error" | "success" | "loading",
  timeout = 3000
): Promise<void> {
  return waitForCondition(() => {
    const state = queryClient.getQueryState(queryKey);
    return state?.status === status;
  }, timeout);
}

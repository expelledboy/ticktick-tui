import React from "react";
import { render } from "ink-testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockState } from "../src/ticktick/api.mock";
import type { Project, Task } from "../src/core/types";
import { useAppStore } from "../src/store";
import type { LogOperation } from "../src/core/logger";
import { getInMemoryLogs } from "../src/core/logger";
/**
 * Helper function to improve error stack traces by removing the helper function frame
 * from the stack trace. This makes errors appear to come from where the helper
 * was invoked rather than from inside the helper.
 */
export function enhanceError(
  error: Error,
  omitFunction: Function,
  customMessage?: string
): Error {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, omitFunction);
  }

  if (customMessage) {
    error.message = `${customMessage}\n${error.message}`;
  }

  return error;
}

/**
 * Strip ANSI escape codes (colors, formatting) from terminal output
 */
export const stripAnsi = (text: string | undefined): string => {
  if (!text) return "";

  // This regex matches all ANSI escape sequences
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
};

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

  const error = new Error(
    `Timeout: Text "${text}" not found within ${timeout}ms`
  );
  throw enhanceError(error, waitForText);
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  timeout = 3000,
  condition: () => boolean,
  errorContext?: string
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      // Wait for 1 more tick to ensure UI updates are applied
      await new Promise((resolve) => setTimeout(resolve, 1));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const error = new Error(
    `Timeout: Condition not met within ${timeout}ms` +
      (errorContext ? `\nContext: ${errorContext}` : "")
  );
  throw enhanceError(error, waitForCondition);
}

/**
 * Simulate key presses in the terminal
 */
export const press = async (
  stdin: { write: (input: string) => void },
  key: string
) => {
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
    // https://stackoverflow.com/a/75030219/644945
    ctrl_p: "\u0010",
    ctrl_l: "\u000C",
    ctrl_d: "\u0004",
    ctrl_g: "\u0007",
    ctrl_n: "\u0011",
    ctrl_o: "\u000F",
    ctrl_q: "\u0011",
    ctrl_r: "\u0012",
    ctrl_s: "\u0013",
  };

  // Record initial log count to detect when processing completes
  const initialLogCount = getInMemoryLogs().length;

  // Give time for terminal to render from other events
  await new Promise((resolve) => setTimeout(resolve, 1));

  // Send the key press
  stdin.write(keyMap[key] || key);

  // Wait for key processing to complete by observing logs
  await waitForCondition(
    1000,
    () => {
      const currentLogs = getInMemoryLogs();
      // Look for new log entries indicating key processing
      return (
        currentLogs.length > initialLogCount &&
        currentLogs.some((log) => log.op.includes("KEYBINDING_TRIGGERED"))
      );
    },
    `Key press: ${key}`
  );

  // Wait for react to render
  await new Promise((resolve) => setTimeout(resolve, 1));
};

/**
 * Type a string in the terminal
 */
export const typeText = (
  stdin: { write: (input: string) => void },
  text: string
) => {
  for (const char of text) {
    stdin.write(char);
  }
};

/**
 * Add test data to the mock API
 */
export const setupTestData = (
  projects: Array<Partial<Project> & { id: string; name: string }> = [],
  tasks: Array<
    Partial<Task> & { id: string; projectId: string; title: string }
  > = []
) => {
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
};

/**
 * Wait for a specific query status (success, error, loading)
 */
export async function waitForQueryStatus(
  queryClient: QueryClient,
  queryKey: any[],
  status: "error" | "success" | "loading",
  timeout = 3000
): Promise<void> {
  return waitForCondition(
    timeout,
    () => {
      const state = queryClient.getQueryState(queryKey);
      return state?.status === status;
    },
    `Query status: ${status}`
  );
}

/**
 * Wait for a specific log operation to occur
 * This is useful for waiting for specific application events during testing
 */
export async function waitForLogOperation(
  operation: LogOperation,
  match: Record<string, any>,
  timeout = 3000
): Promise<Record<string, any>> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // Access logs from store
    const rawLogs = useAppStore.getState().logs;

    // Build matchers for each key-value pair
    const matchers = Object.entries(match).map(
      ([key, value]) => new RegExp(`${key}=${value}`)
    );

    // For every matcher, check if the log message matches
    const found = rawLogs.find((log) => {
      return (
        log.message.includes(`[${operation}]`) &&
        matchers.every((matcher) => matcher.test(log.message))
      );
    });

    if (found) return found;

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const errorMessage = `Timeout: Log operation "${operation}" not found within ${timeout}ms`;

  // When timeout occurs, provide debug info
  console.error(errorMessage);

  // Get the last 5 logs for debugging
  const rawLogs = useAppStore.getState().logs;
  console.error("Last 5 logs:");
  rawLogs.slice(-5).forEach((log) => {
    console.error(`[${log.level}] ${log.message}`);
  });

  const error = new Error(errorMessage);
  throw enhanceError(error, waitForLogOperation);
}

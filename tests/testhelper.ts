import React from "react";
import { expect } from "bun:test";
import { DEBUG } from "../src/constants";
import { useAppStore } from "../src/store";
import {
  getInMemoryLogs,
  type LogData,
  type LogOperation,
} from "../src/core/logger";
import { renderWithQuery } from "./utils";

const DEFAULT_TIMEOUT = 1000;

const LINE = Array(80).fill("-").join("");

const logErrorWithFrame = (errorMsg: string, frame: string) => {
  if (DEBUG) console.log(`${errorMsg}\n${LINE}\n${frame}\n${LINE}`);
};

const logFrame = (frame: string) => {
  if (DEBUG) console.log(`${LINE}\n${frame}\n${LINE}`);
};

/**
 * Helper function to improve error stack traces by removing the helper function frame
 * from the stack trace. This makes errors appear to come from where the helper
 * was invoked rather than from inside the helper.
 */
function enhanceError(
  error: Error,
  omitFunction: Function,
  customMessage?: string
): Error {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, omitFunction);
  }

  if (customMessage) {
    error.message = `${error.message}\n${customMessage}`;
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
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = DEFAULT_TIMEOUT
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      // Wait for 1 more tick to ensure UI updates are applied
      await new Promise((resolve) => setTimeout(resolve, 1));
      return true;
    }

    // Refresh rate
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return false;
}

/**
 * Wait for a specific log operation to occur
 * This is useful for waiting for specific application events during testing
 */
export async function waitForLogOperation(
  operation: LogOperation,
  match: Record<string, string | RegExp>,
  filterFromLogIndex?: number,
  timeout = DEFAULT_TIMEOUT
): Promise<LogData | false> {
  // Record initial log count to detect when processing completes
  const initialLogCount =
    filterFromLogIndex !== undefined
      ? filterFromLogIndex
      : getInMemoryLogs().length;

  // XXX: we dont use waitForCondition because we want to return the log
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // Access logs from in-memory logs collection instead of store
    const inMemoryLogs = getInMemoryLogs();

    // Remove the initial log count from the current logs
    const logsSinceInitial = inMemoryLogs.slice(initialLogCount);

    // For every matcher, check if the log message matches
    const found = logsSinceInitial.find((log) => {
      return (
        log.op === operation &&
        Object.entries(match).every(([key, value]) => {
          if (typeof value === "string") {
            return log.data[key].toString().includes(value);
          }

          return value.test(log.data[key].toString());
        })
      );
    });

    if (found) return found.data;

    // Refresh the condition every 10ms
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return false;
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
    return: "\r",
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

  const result = await waitForLogOperation("KEY_PRESSED", {}, initialLogCount);

  if (!result) {
    console.error(
      `current logs`,
      getInMemoryLogs()
        .slice(initialLogCount)
        .map(
          (log) =>
            `${log.op} ${Object.entries(log.data)
              .map(([key, value]) => `${key}=${value}`)
              .join(" ")}`
        )
    );

    throw enhanceError(
      new Error(`Timeout waiting for key press ${key}`),
      press
    );
  }

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
 * Creates a comprehensive test helper for working with UI components
 * Provides methods for rendering, querying, and asserting on components
 */
export function createTestHelper(uiComponent: React.ReactElement) {
  const app = renderWithQuery(uiComponent);

  // Snapshot of the last frame from result.lastFrame()
  let currentFrame = "";

  /**
   * UI interaction and assertion helpers
   */
  const ui = {
    /**
     * Captures the current UI frame as a snapshot
     */
    createSnapshot: () => {
      const frame = app.lastFrame() || "";
      currentFrame = stripAnsi(frame);
      logFrame(frame);
      return currentFrame;
    },

    /**
     * Get the current UI frame
     */
    getFrame: () => currentFrame || ui.createSnapshot(),

    /**
     * Check if the current frame contains a pattern
     */
    contains: (pattern: string, customMessage?: string) => {
      try {
        expect(currentFrame).toContain(pattern);
      } catch (error) {
        logErrorWithFrame(
          customMessage || `Expected to contain: ${pattern}`,
          currentFrame
        );

        throw enhanceError(error as Error, ui.contains);
      }
    },

    /**
     * Check if the current frame does not contain a pattern
     */
    doesNotContain: (pattern: string, customMessage?: string) => {
      try {
        expect(currentFrame).not.toContain(pattern);
      } catch (error) {
        logErrorWithFrame(
          customMessage || `Expected to not contain: ${pattern}`,
          currentFrame
        );

        throw enhanceError(error as Error, ui.doesNotContain);
      }
    },

    /**
     * Check if the current frame matches a regex pattern
     */
    matches: (pattern: RegExp, customMessage?: string) => {
      try {
        expect(currentFrame).toMatch(pattern);
      } catch (error) {
        logErrorWithFrame(
          customMessage || `Expected to match: ${pattern}`,
          currentFrame
        );

        throw enhanceError(error as Error, ui.matches);
      }
    },

    /**
     * Wait for a view to be rendered
     */
    viewRendered: async (component: string) => {
      const result = await waitForLogOperation(
        "VIEW_RENDERED",
        { component },
        0
      );

      ui.createSnapshot();

      if (result) {
        return;
      }

      console.error(`current logs`, getInMemoryLogs());

      throw enhanceError(
        new Error(`Timeout waiting for ${component} to be rendered`),
        ui.viewRendered
      );
    },
  };

  /**
   * Log assertion helpers
   */
  const logs = {
    /**
     * Check if the logs contain an event with specific properties
     */
    contains: (
      event: string,
      properties: Record<string, RegExp>,
      customMessage?: string
    ) => {
      const keys = Object.keys(properties);

      const matchingLogs = getInMemoryLogs()
        .filter((log) => log.op === event)
        .filter((log) => {
          return keys.every((key) => {
            const value = log.data[key];
            if (typeof value === "string") {
              return properties[key].test(value);
            }
            return false;
          });
        });

      const propsStr = keys
        .map((key) => `${key}=${properties[key].source}`)
        .join(" ");
      const defaultPostfix = `[${event}]: ${propsStr}`;

      if (matchingLogs.length === 0) {
        logErrorWithFrame(
          customMessage || `No log found ${defaultPostfix}`,
          currentFrame
        );

        throw enhanceError(new Error(), logs.contains);
      }

      return matchingLogs;
    },

    /**
     * Wait for a specific log to appear in the logs
     * Returns true when log is found, otherwise false on timeout
     */
    waitFor: async (
      operation: LogOperation,
      properties: Record<string, RegExp | string>,
      customMessage?: string,
      timeout = DEFAULT_TIMEOUT
    ): Promise<LogData | false> => {
      const result = await waitForLogOperation(operation, properties, timeout);

      if (result) return result;

      const errorMessage =
        customMessage ||
        `Timeout: Log operation "${operation}" not found within ${timeout}ms`;

      // When timeout occurs, provide debug info using formatted logs from store
      console.error(errorMessage);

      // Get the last 5 logs for debugging from the store (already formatted)
      const rawLogs = useAppStore.getState().logs;
      console.error("Last 5 logs (excluding logToInMemory calls):");
      rawLogs.slice(-5).forEach((log) => {
        console.error(`[${log.level}] ${log.message}`);
      });

      throw enhanceError(
        new Error("Timeout waiting for log operation"),
        waitForLogOperation
      );
    },
  };

  /**
   * User action helpers
   */
  const user = {
    _acts: async (description: string, action: Promise<void>) => {
      if (DEBUG) console.log(`User ${description}...`);
      await action;
      ui.createSnapshot();
    },

    /**
     * Perform an action with a descriptive label
     */
    does: (actions: Promise<void>) => {
      return {
        sees: async (description: string, visualChecks: () => void) => {
          try {
            await actions;
            if (DEBUG) console.log(`And ${description}...`);
            visualChecks();
            return user;
          } catch (error) {
            logErrorWithFrame(`Expected to see ${description}`, ui.getFrame());
            throw error;
          }
        },
      };
    },

    /**
     * Press a key
     */
    press: (key: string) => {
      return user._acts(`presses ${key}`, press(app.stdin, key));
    },

    /**
     * Type text
     */
    type: (text: string) => {
      return user._acts(
        `types "${text}"`,
        Promise.resolve().then(() => {
          typeText(app.stdin, text);
        })
      );
    },
  };

  /**
   * Remote state helpers, form react-query
   */
  const query = {
    client: app.queryClient,

    /**
     * Wait for a specific query status (success, error, loading)
     */
    waitForQueryStatus: async (
      queryKey: string[],
      status: "error" | "success" | "loading"
    ) => {
      const result = await waitForCondition(() => {
        const state = query.client.getQueryState(queryKey);
        return state?.status === status;
      });

      if (!result) {
        throw enhanceError(
          new Error(
            `Timeout waiting for ${queryKey.join(".")} to be ${status}`
          ),
          query.waitForQueryStatus
        );
      }
    },
  };

  return {
    // Enhanced test helpers
    ui,
    logs,
    user,
    query,

    // Expose app methods
    rawFrame: app.lastFrame,
    unmount: app.unmount,
    frames: app.frames,

    // Wrapped helpers
    press: async (key: string) => await press(app.stdin, key),
    type: (text: string) => typeText(app.stdin, text),
    lastFrame: () => stripAnsi(app.lastFrame() || ""),
  };
}

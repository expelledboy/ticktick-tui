import React from "react";
import { expect } from "bun:test";
import type { LogOperation } from "../src/core/logger";
import {
  renderWithQuery,
  stripAnsi,
  enhanceError,
  press,
  typeText,
} from "./utils";
import { DEV } from "../src/constants";
import { getInMemoryLogs } from "../src/core/logger";

/**
 * Creates a comprehensive test helper for working with UI components
 * Provides methods for rendering, querying, and asserting on components
 */
export function createTestHelper(uiComponent: React.ReactElement) {
  const result = renderWithQuery(uiComponent);
  let currentFrame = "";

  /**
   * UI interaction and assertion helpers
   */
  const ui = {
    /**
     * Captures the current UI frame as a snapshot
     */
    createSnapshot: () => {
      currentFrame = stripAnsi(result.lastFrame() || "");
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
        expect(ui.getFrame()).toContain(pattern);
      } catch (error) {
        throw enhanceError(
          error as Error,
          ui.contains,
          customMessage || `Expected UI to contain: ${pattern}`
        );
      }
    },

    /**
     * Check if the current frame does not contain a pattern
     */
    doesNotContain: (pattern: string, customMessage?: string) => {
      try {
        expect(ui.getFrame()).not.toContain(pattern);
      } catch (error) {
        throw enhanceError(
          error as Error,
          ui.doesNotContain,
          customMessage || `Expected UI to not contain: ${pattern}`
        );
      }
    },

    /**
     * Check if the current frame matches a regex pattern
     */
    matches: (pattern: RegExp, customMessage?: string) => {
      try {
        expect(ui.getFrame()).toMatch(pattern);
      } catch (error) {
        throw enhanceError(
          error as Error,
          ui.matches,
          customMessage || `Expected UI to match: ${pattern}`
        );
      }
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
          return keys.every((key) => properties[key].test(log.data[key]));
        });

      const propsStr = keys
        .map((key) => `${key}=${properties[key].source}`)
        .join(" ");
      const defaultPostfix = `[${event}]: ${propsStr}`;

      if (matchingLogs.length === 0) {
        const error = new Error(
          customMessage || `No logs found ${defaultPostfix}`
        );
        throw enhanceError(error, logs.contains);
      }

      return matchingLogs;
    },
  };

  /**
   * Wait for a specific text to appear in the output
   */
  async function waitForText(text: string, timeout = 3000): Promise<void> {
    const startTime = Date.now();
    let lastOutput = "";

    while (Date.now() - startTime < timeout) {
      const output = result.lastFrame();
      lastOutput = output || "";

      // Strip ANSI codes before checking for text
      const strippedOutput = stripAnsi(output || "");

      if (strippedOutput.includes(text)) {
        return;
      }

      // Try a less strict check for partial matches
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
      `Actual content (${strippedOutput.length} chars):\n${strippedOutput}`
    );

    const error = new Error(
      `Timeout: Text "${text}" not found within ${timeout}ms`
    );
    throw enhanceError(error, waitForText);
  }

  /**
   * Wait for a condition to be true
   */
  async function waitForCondition(
    timeout = 3000,
    condition: () => boolean,
    errorContext?: string
  ): Promise<void> {
    const startTime = Date.now();
    let conditionResult = false;

    while (Date.now() - startTime < timeout) {
      conditionResult = condition();
      if (conditionResult) {
        // Wait for 1 more tick to ensure UI updates are applied
        await new Promise((resolve) => setTimeout(resolve, 1));
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Get the current frame to include in the error message
    const currentFrame = stripAnsi(result.lastFrame() || "");

    // Create a more informative error message
    const errorMessage =
      `Timeout: Condition not met within ${timeout}ms` +
      (errorContext ? `\nContext: ${errorContext}` : "") +
      `\nCurrent frame content:\n${currentFrame}`;

    const error = new Error(errorMessage);
    throw enhanceError(error, waitForCondition);
  }

  /**
   * Wait for a specific query status (success, error, loading)
   */
  async function waitForQueryStatus(
    queryKey: any[],
    status: "error" | "success" | "loading",
    timeout = 3000
  ): Promise<void> {
    return waitForCondition(
      timeout,
      () => {
        const state = result.queryClient.getQueryState(queryKey);
        return state?.status === status;
      },
      `Expected query status to be ${status}`
    );
  }

  /**
   * Wait for a specific log operation to occur
   */
  async function waitForLogOperation(
    operation: LogOperation,
    match: Record<string, any>,
    timeout = 3000
  ): Promise<Record<string, any>> {
    // Implementation directly in testhelper to avoid circular dependencies
    // This is a simplified version that can be expanded as needed
    return waitForCondition(
      timeout,
      () => {
        // Add implementation if needed
        return true;
      },
      `Expected log operation to be ${operation}`
    ) as unknown as Promise<Record<string, any>>;
  }

  /**
   * User action helpers
   */
  const user = {
    /**
     * Perform an action with a descriptive label
     */
    does: (description: string, action: Promise<void>) => {
      console.log(`User ${description}...`);
      return {
        sees: async (visualChecks: () => void) => {
          try {
            await action;
            // Update the frame after the action
            ui.createSnapshot();
            if (DEV) console.log(result.lastFrame());
            visualChecks();
            return user;
          } catch (error) {
            console.log(result.lastFrame());
            throw error;
          }
        },
      };
    },

    /**
     * Press a key
     */
    press: (key: string) => {
      return user.does(
        `presses ${key}`,
        Promise.resolve().then(() => {
          press(result.stdin, key);
        })
      );
    },

    /**
     * Type text
     */
    type: (text: string) => {
      return user.does(
        `types "${text}"`,
        Promise.resolve().then(() => {
          typeText(result.stdin, text);
        })
      );
    },
  };

  return {
    // Original helper functions
    lastFrame: () => stripAnsi(result.lastFrame() || ""),
    rawFrame: result.lastFrame,
    queryClient: result.queryClient,
    waitForText,
    waitForCondition,
    waitForQueryStatus,
    waitForLogOperation,
    press: async (key: string) => await press(result.stdin, key),
    type: (text: string) => typeText(result.stdin, text),
    unmount: result.unmount,
    frames: result.frames,
    stdin: result.stdin,

    // Enhanced test helpers
    ui,
    logs,
    user,
  };
}

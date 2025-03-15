import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "ink-testing-library";
import React, { useState } from "react";
import { mockState } from "../src/ticktick/api.mock";
import type { Project, Task } from "../src/core/types";

/**
 * Props controller interface
 */
export interface PropController {
  setProps: <T extends Record<string, any>>(newProps: T) => void;
}

/**
 * Creates a component with dynamic props from a render function
 * This allows props to be updated during test execution
 *
 * This is a simplified version that works better with Ink's rendering model
 */
export function createPropsController<P extends object = {}>(
  renderFn: (props: P) => React.ReactElement,
  initialProps: P = {} as P
): [React.ReactElement, PropController] {
  // Create a simple container component that manages props via state
  const Container = () => {
    const [props, setProps] = useState<P>(initialProps);

    // Expose the setProps function globally for the test to use
    (Container as any).setProps = (newProps: Partial<P>) => {
      setProps((prev) => ({ ...prev, ...newProps }));
    };

    return renderFn(props);
  };

  // Create a props controller that uses the exposed setProps function
  const controller: PropController = {
    setProps: (newProps) => {
      // Directly call the setProps function on the Container
      if ((Container as any).setProps) {
        (Container as any).setProps(newProps);
      } else {
        console.error(
          "Container not mounted yet - try using a timeout before setting props"
        );
      }
    },
  };

  return [<Container />, controller];
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

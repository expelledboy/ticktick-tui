import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "ink-testing-library";
import { mockState } from "../src/ticktick/api.mock";
import type { Project, Task } from "../src/core/types";

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

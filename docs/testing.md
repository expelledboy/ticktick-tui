# TickTick TUI Testing Framework

This guide introduces our testing approach for the terminal-based TickTick TUI application, which uses Ink for rendering and React Query for data management.

## Core Testing Utilities

Our testing framework provides specialized utilities for testing Ink components with React Query:

```typescript
// Basic utilities for working with terminal output
stripAnsi(text: string): string                 // Removes ANSI color codes from terminal output
press(stdin, key: string): void                 // Simulates pressing a keyboard key
typeText(stdin, text: string): void             // Simulates typing text

// React Query specific utilities
createTestQueryClient(): QueryClient            // Creates a pre-configured QueryClient for testing
renderWithQuery(ui: ReactElement): RenderResult // Renders a component with React Query provider

// Waiting utilities
waitForText(getOutput, text, timeout?): Promise<void>  // Waits for text to appear in output
waitForCondition(condition, timeout?): Promise<void>   // Waits for a condition to be true
waitForQueryStatus(                                    // Waits for a query to reach a specific status
  queryClient, 
  queryKey, 
  status: 'error'|'success'|'loading', 
  timeout?
): Promise<void>

// Test data setup
setupTestData(projects?, tasks?): void          // Sets up mock data for tests

// Component testing helper
createTestHelper(ui: ReactElement): TestHelper  // Creates a comprehensive helper for component testing
```

## Using the Test Helper

The `createTestHelper` function returns an object with methods for testing Ink components:

```typescript
const helper = createTestHelper(<YourComponent />);

// Getting output
const output = helper.lastFrame();               // Get current frame (with ANSI codes stripped)
const rawOutput = helper.rawFrame();             // Get current frame with ANSI codes

// Working with React Query
const { queryClient } = helper;                  // Access QueryClient directly
await helper.waitForQueryStatus(['todos'], 'success');  // Wait for query to succeed

// Simulating user input
helper.press('down');                            // Press the down arrow key
helper.type('Hello');                            // Type text

// Waiting for conditions
await helper.waitForText('Expected text');       // Wait for text to appear
await helper.waitForCondition(() => condition);  // Wait for a custom condition
```

## Testing Patterns

### Testing Query States

Components using React Query typically have three states: loading, error, and success. Test all three:

```typescript
// Testing loading state
const helper = createTestHelper(<ProjectList />);
expect(helper.lastFrame()).toContain('Loading');

// Testing success state
setupTestData([{ id: 'project-1', name: 'Project 1', sortOrder: 1 }]);
await helper.waitForQueryStatus(['projects'], 'success');
expect(helper.lastFrame()).toContain('Project 1');

// Testing error state
mockState.getAllProjects = mock(() => { throw new Error('Failed to fetch'); });
await helper.waitForQueryStatus(['projects'], 'error');
expect(helper.lastFrame()).toContain('Error');
```

### Testing User Interaction

For testing user interactions like navigation:

```typescript
// Set up test with multiple items
setupTestData([
  { id: 'project-1', name: 'Project 1' },
  { id: 'project-2', name: 'Project 2' }
]);

const helper = createTestHelper(<ProjectList />);
await helper.waitForQueryStatus(['projects'], 'success');

// Verify initial selection
expect(helper.lastFrame()).toContain('› Project 1');

// Navigate and verify new selection
helper.press('down');
await helper.waitForCondition(() => helper.lastFrame().includes('› Project 2'));
```

## Complete E2E Testing Example

Here's a complete example of an end-to-end test that demonstrates how to use our testing utilities together to verify a user flow:

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { App } from '../src/app/App';
import { createTestHelper, setupTestData } from './utils';
import { mockState } from '../src/ticktick/api.mock';

describe('Task Management E2E', () => {
  beforeEach(() => {
    // Start each test with a clean state
    mockState.reset();
  });

  test('can create and complete a task', async () => {
    // Setup initial project
    setupTestData([
      { id: 'project-1', name: 'Test Project', sortOrder: 0 }
    ]);
    
    // Create test environment with the full app
    const helper = createTestHelper(<App />);
    
    // Wait for project list to load and select the project
    await helper.waitForQueryStatus(['projects'], 'success');
    await helper.waitForText('Test Project');
    helper.press('enter');
    
    // Wait for project view to load (shows empty state)
    await helper.waitForQueryStatus(['project', 'project-1', 'data'], 'success');
    await helper.waitForText('No tasks found');
    
    // Press 'n' to create a new task
    helper.press('n');
    
    // Wait for the task creation form
    await helper.waitForText('Title:');
    
    // Type task title and submit
    helper.type('My New Task');
    helper.press('enter');
    
    // Wait for description field and submit (leaving it empty)
    await helper.waitForText('Description:');
    helper.press('enter');
    
    // Wait for priority field, use arrow keys to select High priority
    await helper.waitForText('Priority:');
    helper.press('right');
    helper.press('right'); 
    helper.press('enter');
    
    // Wait for the task to appear in the list
    await helper.waitForQueryStatus(['project', 'project-1', 'data'], 'success');
    await helper.waitForText('My New Task');
    
    // Verify task priority is displayed correctly
    expect(helper.lastFrame()).toContain('⚑');  // High priority symbol
    
    // Select the task
    helper.press('down');
    
    // Press space to complete the task
    helper.press('space');
    
    // Wait for the task to be updated
    await helper.waitForQueryStatus(['project', 'project-1', 'data'], 'success');
    
    // Verify task is marked as completed
    expect(helper.lastFrame()).toContain('✓ My New Task');
  });
});
```

This example demonstrates:
- Setting up test data with `setupTestData`
- Creating a test helper with `createTestHelper`
- Waiting for queries to complete with `waitForQueryStatus`
- Waiting for specific text with `waitForText`
- Simulating user navigation with `press` and `type`
- Making assertions about the UI state

It tests a complete user journey from viewing projects, selecting a project, creating a new task, setting its priority, and marking it as complete - exercising most of the application's core functionality.

## Mocking API Calls

Our testing framework uses a mock API system:

```typescript
// The mockState provides an in-memory database for tests
mockState.reset();                        // Reset all mock data
mockState.addProject(project);            // Add a project to mock state
mockState.getAllProjects();               // Get all projects from mock state

// For testing error cases, mock specific methods
const originalMethod = mockState.getAllProjects;
const mockMethod = mock(() => { throw new Error('Test error'); });
mockState.getAllProjects = mockMethod;    // Replace with mock implementation

try {
  // Run your test...
} finally {
  // Always restore the original in a finally block
  mockState.getAllProjects = originalMethod;
}
```

## Waiting for React Query

Instead of using arbitrary timeouts, use the `waitForQueryStatus` utility to wait for specific query states:

```typescript
// Wait for a query to succeed
await helper.waitForQueryStatus(['projects'], 'success');

// Wait for a query to fail
await helper.waitForQueryStatus(['projects'], 'error');

// Wait for a query to be in loading state
await helper.waitForQueryStatus(['projects'], 'loading');
```

This approach:
- Is more reliable than timeouts
- Makes tests faster by not waiting longer than necessary
- Makes tests more deterministic
- Explicitly communicates what the test is waiting for

## Common Testing Challenges

### ANSI Color Codes

Terminal output contains ANSI codes for colors which can break text matching:

```typescript
// Instead of:
expect(frame).toContain('› Project 1');  // May fail due to ANSI codes

// Use:
expect(stripAnsi(frame)).toContain('› Project 1');  // Safer approach

// Or use the helper's lastFrame() which automatically strips ANSI codes:
expect(helper.lastFrame()).toContain('› Project 1');
```

### Debugging Failed Tests

When tests fail, especially with asynchronous operations, our enhanced utilities provide detailed output:

```typescript
// When waitForText fails, it shows:
// - The expected text
// - The actual content found
// - The length of the content (helpful for whitespace issues)

// For query-related issues, you can inspect the query state:
console.log(queryClient.getQueryState(['projects']));

// For component output issues:
console.log("Current UI output:", stripAnsi(helper.lastFrame()));
```

## Best Practices

1. **Reset between tests**: Always start with a clean state
   ```typescript
   beforeEach(() => {
     setupTestData();
     useAppStore.getState().setError(null);
   });
   ```

2. **Test all query states**: Check loading, success, and error states

3. **Wait for query status, not timers**: Use `waitForQueryStatus` instead of `setTimeout`
   ```typescript
   // Instead of:
   await new Promise(resolve => setTimeout(resolve, 1000));
   
   // Use:
   await helper.waitForQueryStatus(['projects'], 'error');
   ```

4. **Verify multiple indicators**: Check both UI and application state
   ```typescript
   // Check UI
   expect(helper.lastFrame()).toContain("Error message");
   
   // Check application state
   expect(useAppStore.getState().error).not.toBeNull();
   ```

5. **Always restore mocks**: Use `try/finally` blocks to ensure cleanup
   ```typescript
   try {
     // Your test...
   } finally {
     mockState.getAllProjects = originalMethod;
   }
   ```

6. **Configure test QueryClient**: Disable retries for predictable tests
   ```typescript
   // Our createTestQueryClient already sets:
   {
     retry: false,
     staleTime: Infinity,
     gcTime: Infinity
   }
   ``` 
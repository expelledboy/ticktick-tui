# KeyBindingSystem Documentation

## Overview

The KeyBindingSystem provides a priority-based approach to handling keyboard input in the application. It's designed to resolve conflicts between multiple key bindings that match the same input, ensuring a predictable and customizable user experience.

## Core Concepts

### Binding Priority

When multiple key bindings could match the same input, the system uses a priority-based approach to determine which one to use:

1. **ExactModeMatch (Highest)**: When the binding's category exactly matches the current mode
2. **GlobalAction (Medium)**: For global actions or non-view-specific actions in global mode
3. **Fallback (Lowest)**: For other bindings that are active but don't fit the above categories

### Binding Context

Each binding is evaluated within a specific context that includes:

- **mode**: The current application mode (global, projects, project, task)
- **activeView**: The current view being displayed

### Binding Activation Rules

A binding is considered active when:

- It's in the `global` category (active in all contexts)
- It's a non-view category (navigation, ui, etc.) and the mode is `global`
- It's a view category (projects, project, task) and either:
  - The mode matches the category, OR
  - The activeView matches the category

This flexible approach allows view-specific bindings to work even when the mode doesn't exactly match the activeView, which is particularly useful for keybinding logging and consistent UI behavior.

## Usage

### In Components

```typescript
// Import the hook
import { useKeyHandler } from '../keybindings/useKeyHandler';

// In your component
const MyComponent = () => {
  // Register handler for a specific mode
  useKeyHandler('project', (category, action) => {
    if (category === 'navigation' && action === 'up') {
      // Handle up navigation
    }
    
    if (category === 'project' && action === 'newTask') {
      // Handle new task creation
    }
  });
  
  // Rest of your component
};
```

### Custom Keybindings

Users can customize keybindings by modifying the JSON configuration file at the path specified in application settings. The format is:

```json
{
  "global": {
    "quit": "q",
    "help": "?"
  },
  "navigation": {
    "up": "k",
    "down": "j"
  }
}
```

## Advanced Usage

### Debugging Keybindings

When a key doesn't seem to be working as expected:

1. Check the context (mode and activeView) - use debugger or debugging panels
2. Verify the binding is active in that context - use `getBindingPriorities` utility
3. Check for conflicting bindings with higher priority - see the debug logs

### Implementing Custom Handlers

For custom key handling logic:

```typescript
import { 
  findMatchingBinding,
  configToBindings,
  KeyContext
} from './KeyBindingSystem';

// Convert config to bindings (once)
const bindings = configToBindings(myConfig);

// Create context
const context: KeyContext = { 
  mode: 'project', 
  activeView: 'project' 
};

// Process input
const rawInput = { input: 'n', key: { /* ... */ } };
const binding = findMatchingBinding(bindings, rawInput, context);

if (binding) {
  // Handle the binding
}
```

## Architecture

The system is designed as a set of pure functions for testability and predictability:

- `parseKeyPattern`: Parses key strings like "ctrl+shift+n" into structured data
- `matchesInput`: Checks if a binding matches raw input
- `isBindingActiveInContext`: Determines if a binding is active in current context
- `getBindingPriority`: Assigns a priority to a binding based on context
- `findMatchingBinding`: Finds the highest priority binding that matches input

The `useKeyHandler` hook provides a React-friendly interface to these functions. 
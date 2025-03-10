import * as types from "./types";

/**
 * Represents a task status
 * 0: Normal, 2: Completed
 */
export function formatTaskStatus(status: types.TaskStatus): string {
  switch (status) {
    case 0:
      return "☐ ";
    case 2:
      return "✓ ";
  }
}

/**
 * Represents a task priority level according to TickTick API
 * 0: None, 1: Low, 3: Medium, 5: High
 */
export function formatTaskPriority(priority: types.TaskPriority): string {
  switch (priority) {
    case 0:
      return "none";
    case 1:
      return "low";
    case 3:
      return "medium";
    case 5:
      return "high";
  }
}

/**
 * Represents a checklist item status
 * 0: Normal, 1: Completed
 */
export function formatChecklistItemStatus(
  status: types.ChecklistItemStatus
): string {
  switch (status) {
    case 0:
      return "☐ ";
    case 1:
      return "✓ ";
  }
}

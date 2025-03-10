/**
 * Represents a task priority level according to TickTick API
 * 0: None, 1: Low, 3: Medium, 5: High
 */
export type TaskPriority = 0 | 1 | 3 | 5;

/**
 * Represents a task status
 * 0: Normal, 2: Completed
 */
export type TaskStatus = 0 | 2;

/**
 * Represents a checklist item status
 * 0: Normal, 1: Completed
 */
export type ChecklistItemStatus = 0 | 1;

/**
 * Represents a project's view mode
 */
export type ProjectViewMode = "list" | "kanban" | "timeline";

/**
 * Represents a project's kind
 */
export type ProjectKind = "TASK" | "NOTE";

/**
 * Represents a project's permission
 */
export type ProjectPermission = "read" | "write" | "comment";

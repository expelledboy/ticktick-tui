import { z } from 'zod';

/**
 * This file contains Zod schemas for validating TickTick API data structures.
 * The schemas are based on the TickTick API documentation and match the expected
 * data formats for tasks, projects, and related entities.
 * 
 * Schemas defined here are used for:
 * 1. Runtime validation of API responses
 * 2. TypeScript type generation
 * 3. Documentation of data structures
 */

/**
 * Represents a subtask/checklist item within a task
 */
export const ChecklistItemSchema = z.object({
  id: z.string().describe('Subtask identifier'),
  title: z.string().describe('Subtask title'),
  status: z.number().int().describe('The completion status of subtask - 0: Normal, 1: Completed'),
  completedTime: z.coerce.date().optional().describe('Subtask completed time in "yyyy-MM-dd\'T\'HH:mm:ssZ" format'),
  isAllDay: z.boolean().optional().describe('Whether the subtask is scheduled for the entire day'),
  sortOrder: z.number().int().optional().describe('Subtask sort order position value'),
  startDate: z.coerce.date().optional().describe('Subtask start date time in "yyyy-MM-dd\'T\'HH:mm:ssZ" format'),
  timeZone: z.string().optional().describe('Subtask timezone, e.g., "America/Los_Angeles"'),
});

/**
 * Represents a task in TickTick
 */
export const TaskSchema = z.object({
  id: z.string().describe('Task identifier'),
  projectId: z.string().describe('Task project id'),
  title: z.string().describe('Task title'),
  content: z.string().optional().describe('Task content/notes'),
  desc: z.string().optional().describe('Task description of checklist'), // Unclear distinction between content and desc
  isAllDay: z.boolean().optional().describe('Whether the task is scheduled for the entire day'),
  completedTime: z.coerce.date().optional().describe('Task completed time in "yyyy-MM-dd\'T\'HH:mm:ssZ" format'),
  dueDate: z.coerce.date().optional().describe('Task due date time in "yyyy-MM-dd\'T\'HH:mm:ssZ" format'), // 2025-03-11T22:00:00.000+0000 or Tue Mar 11 2025 01:21:22 GMT+0700 (Indochina Time)
  items: z.array(ChecklistItemSchema).optional().describe('Subtasks of Task'),
  priority: z.number().int().optional().describe('Task priority - 0: None, 1: Low, 3: Medium, 5: High'),
  reminders: z.array(z.string()).optional().describe('List of reminder triggers, e.g., ["TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S"]'), // Format uses iCalendar DURATION values
  repeatFlag: z.string().optional().describe('Recurring rules of task in iCalendar format, e.g., "RRULE:FREQ=DAILY;INTERVAL=1"'),
  sortOrder: z.number().int().optional().describe('Task sort order position value'),
  startDate: z.coerce.date().optional().describe('Start date time in "yyyy-MM-dd\'T\'HH:mm:ssZ" format'),
  status: z.number().int().optional().describe('Task completion status - 0: Normal, 2: Completed'),
  timeZone: z.string().optional().describe('Task timezone, e.g., "America/Los_Angeles"'),
});

/**
 * Represents a project (list) in TickTick
 */
export const ProjectSchema = z.object({
  id: z.string().describe('Project identifier'),
  name: z.string().describe('Project name'),
  color: z.string().optional().describe('Project color in hex format, e.g., "#F18181"'),
  sortOrder: z.number().int().optional().describe('Order value for sorting projects'),
  closed: z.boolean().optional().describe('Whether the project is closed/archived'),
  groupId: z.string().optional().describe('Project group identifier'), // Used for folder organization
  viewMode: z.enum(['list', 'kanban', 'timeline']).optional().describe('View mode for the project'),
  permission: z.enum(['read', 'write', 'comment']).optional().describe('User permission level for this project'),
  kind: z.enum(['TASK', 'NOTE']).optional().describe('Project type - TASK or NOTE'),
});

/**
 * Represents a column in a kanban board view
 */
export const ColumnSchema = z.object({
  id: z.string().describe('Column identifier'),
  projectId: z.string().describe('Project identifier that this column belongs to'),
  name: z.string().describe('Column name'),
  sortOrder: z.number().int().optional().describe('Order value for sorting columns'),
});

/**
 * Represents a complete project with all its data
 */
export const ProjectDataSchema = z.object({
  project: ProjectSchema.describe('Project information'),
  tasks: z.array(TaskSchema).describe('Undone tasks under this project'),
  columns: z.array(ColumnSchema).describe('Columns under this project for kanban view'),
});
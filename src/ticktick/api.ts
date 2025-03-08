import type { Project, ProjectData, Task } from "../types";
import { makeRequest } from "../utils/rest";

/**
 * Project API endpoints
 */

// Get all user projects
export const getProjects = () => makeRequest<Project[]>("GET", "/project");

// Get a specific project by ID
export const getProject = (projectId: string) =>
  makeRequest<Project>("GET", `/project/${projectId}`);

// Get project with all its data (tasks and columns)
export const getProjectData = (projectId: string) =>
  makeRequest<ProjectData>("GET", `/project/${projectId}/data`);

// Create a new project
export const createProject = (project: Partial<Project>) =>
  makeRequest<Project>("POST", "/project", project);

// Update an existing project
export const updateProject = (projectId: string, project: Partial<Project>) =>
  makeRequest<Project>("POST", `/project/${projectId}`, project);

// Delete a project
export const deleteProject = (projectId: string) =>
  makeRequest<void>("DELETE", `/project/${projectId}`);

/**
 * Task API endpoints
 */

// Get a specific task by project ID and task ID
export const getTask = (projectId: string, taskId: string) =>
  makeRequest<Task>("GET", `/project/${projectId}/task/${taskId}`);

// Create a new task
export const createTask = (task: Partial<Task>) =>
  makeRequest<Task>("POST", "/task", task);

// Update an existing task
export const updateTask = (taskId: string, task: Partial<Task>) =>
  makeRequest<Task>("POST", `/task/${taskId}`, task);

// Mark a task as complete
export const completeTask = (projectId: string, taskId: string) =>
  makeRequest<void>("POST", `/project/${projectId}/task/${taskId}/complete`);

// Delete a task
export const deleteTask = (projectId: string, taskId: string) =>
  makeRequest<void>("DELETE", `/project/${projectId}/task/${taskId}`);

import { setAuthToken } from "../utils/rest";

/**
 * Export all API functions as a unified object for easier imports
 */
export const api = {
  // Projects
  getProjects,
  getProject,
  getProjectData,
  createProject,
  updateProject,
  deleteProject,

  // Tasks
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,

  // Auth
  setAuthToken,
};

export default api;

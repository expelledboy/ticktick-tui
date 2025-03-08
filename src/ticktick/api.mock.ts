import { mock } from "bun:test";
import type { Project, ProjectData, Task } from "../types";

/**
 * In-memory database for mocked TickTick API data
 */
export const mockState = {
  projects: new Map<string, Project>(),
  tasks: new Map<string, Task>(),

  // Helper methods for managing the mock data
  reset() {
    this.projects.clear();
    this.tasks.clear();
  },

  // Projects
  addProject(project: Project) {
    this.projects.set(project.id, project);
    return project;
  },

  getProject(id: string) {
    return this.projects.get(id);
  },

  getAllProjects() {
    return Array.from(this.projects.values());
  },

  removeProject(id: string) {
    const removed = this.projects.delete(id);

    // Also remove all tasks for this project
    if (removed) {
      for (const [taskId, task] of this.tasks.entries()) {
        if (task.projectId === id) {
          this.tasks.delete(taskId);
        }
      }
    }

    return removed;
  },

  // Tasks
  addTask(task: Task) {
    this.tasks.set(task.id, task);
    return task;
  },

  getTask(id: string) {
    return this.tasks.get(id);
  },

  getTasksForProject(projectId: string) {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  },

  getAllTasks() {
    return Array.from(this.tasks.values());
  },

  removeTask(id: string) {
    return this.tasks.delete(id);
  },

  completeTask(id: string) {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 1; // Assuming 1 means completed
      this.tasks.set(id, task);
      return true;
    }
    return false;
  },
};

/**
 * Returns a mocked version of the API
 */
export const mockApi = () => {
  // Return a mocked version of the API
  const api = {
    // Projects
    getProjects: () => Promise.resolve(mockState.getAllProjects()),

    getProject: (projectId: string) => {
      const project = mockState.getProject(projectId);
      if (!project)
        return Promise.reject(new Error(`Project not found: ${projectId}`));
      return Promise.resolve(project);
    },

    getProjectData: (projectId: string) => {
      const project = mockState.getProject(projectId);
      if (!project)
        return Promise.reject(new Error(`Project not found: ${projectId}`));

      const tasks = mockState.getTasksForProject(projectId);
      return Promise.resolve({
        project,
        tasks,
        columns: [],
      } as ProjectData);
    },

    createProject: (projectData: Partial<Project>) => {
      const id = projectData.id || `mock-project-${Date.now()}`;
      const newProject = {
        ...projectData,
        id,
      } as Project;

      mockState.addProject(newProject);
      return Promise.resolve(newProject);
    },

    updateProject: (projectId: string, projectData: Partial<Project>) => {
      const existingProject = mockState.getProject(projectId);
      if (!existingProject) {
        return Promise.reject(new Error(`Project not found: ${projectId}`));
      }

      const updatedProject = {
        ...existingProject,
        ...projectData,
        id: projectId,
      } as Project;

      mockState.addProject(updatedProject);
      return Promise.resolve(updatedProject);
    },

    deleteProject: (projectId: string) => {
      const removed = mockState.removeProject(projectId);
      if (!removed) {
        return Promise.reject(new Error(`Project not found: ${projectId}`));
      }
      return Promise.resolve();
    },

    // Tasks
    getTask: (projectId: string, taskId: string) => {
      const task = mockState.getTask(taskId);
      if (!task || task.projectId !== projectId) {
        return Promise.reject(new Error(`Task not found: ${taskId}`));
      }
      return Promise.resolve(task);
    },

    createTask: (taskData: Partial<Task>) => {
      const id = taskData.id || `mock-task-${Date.now()}`;

      // Check if project exists
      if (taskData.projectId && !mockState.getProject(taskData.projectId)) {
        return Promise.reject(
          new Error(`Project not found: ${taskData.projectId}`)
        );
      }

      const newTask = {
        ...taskData,
        id,
        status: taskData.status ?? 0,
      } as Task;

      mockState.addTask(newTask);
      return Promise.resolve(newTask);
    },

    updateTask: (taskId: string, taskData: Partial<Task>) => {
      const existingTask = mockState.getTask(taskId);
      if (!existingTask) {
        return Promise.reject(new Error(`Task not found: ${taskId}`));
      }

      const updatedTask = {
        ...existingTask,
        ...taskData,
        id: taskId,
      } as Task;

      mockState.addTask(updatedTask);
      return Promise.resolve(updatedTask);
    },

    completeTask: (projectId: string, taskId: string) => {
      const task = mockState.getTask(taskId);
      if (!task || task.projectId !== projectId) {
        return Promise.reject(new Error(`Task not found: ${taskId}`));
      }

      const completed = mockState.completeTask(taskId);
      if (!completed) {
        return Promise.reject(new Error(`Failed to complete task: ${taskId}`));
      }
      return Promise.resolve();
    },

    deleteTask: (projectId: string, taskId: string) => {
      const task = mockState.getTask(taskId);
      if (!task || task.projectId !== projectId) {
        return Promise.reject(new Error(`Task not found: ${taskId}`));
      }

      const removed = mockState.removeTask(taskId);
      if (!removed) {
        return Promise.reject(new Error(`Failed to delete task: ${taskId}`));
      }
      return Promise.resolve();
    },

    // Auth - Just a no-op for tests
    setAuthToken: (token: string) => {},
  };

  return {
    api,
    default: api,
  };
};

/**
 * Reset the mock state
 */
export const resetMocks = () => {
  mockState.reset();
};

/**
 * Add sample data to the mock state
 */
export const addMockData = (projects: Project[], tasks: Task[] = []) => {
  projects.forEach((project) => mockState.addProject(project));
  tasks.forEach((task) => mockState.addTask(task));
};

// Export a default object with all mock functions for easier imports
export default {
  mockState,
  resetMocks,
  addMockData,
};

mock.module("./api", mockApi);

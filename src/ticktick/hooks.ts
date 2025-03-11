import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAppStore } from "../store";
import type { Project, ProjectData, Task } from "../core/types";

// Enhanced query key structure for more granular cache control
const QUERY_KEYS = {
  // Project related keys
  projects: {
    all: ["projects"],
    byId: (id: string) => ["project", id],
    data: (id: string) => ["project", id, "data"],
  },

  // Task related keys
  tasks: {
    all: (projectId: string) => ["tasks", projectId],
    byId: (projectId: string, taskId: string) => ["tasks", projectId, taskId],
    completed: (projectId: string) => ["tasks", projectId, "completed"],
    active: (projectId: string) => ["tasks", projectId, "active"],
  },
};

// Default options for queries to optimize TUI performance
const defaultQueryOptions = {
  structuralSharing: (oldData: any, newData: any) => {
    // Only update if data has actually changed
    if (JSON.stringify(oldData) === JSON.stringify(newData)) {
      return oldData;
    }
    return newData;
  },
};

// Default mutation options for better TUI experience
const defaultMutationOptions = {
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 10000),
};

// Query Hooks
// ----------------

/**
 * Hook for accessing and syncing projects
 */
export const useProjects = () => {
  const setError = useAppStore((state) => state.setError);

  return useQuery({
    queryKey: QUERY_KEYS.projects.all,
    queryFn: async () => {
      try {
        return await api.getProjects();
      } catch (error) {
        if (error instanceof Error) {
          setError(`Failed to load projects: ${error.message}`);
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    structuralSharing: defaultQueryOptions.structuralSharing,
  });
};

/**
 * Hook for accessing and syncing tasks for a specific project
 */
export const useProjectData = (projectId: string) => {
  const setError = useAppStore((state) => state.setError);

  return useQuery({
    queryKey: QUERY_KEYS.projects.data(projectId),
    queryFn: async () => {
      try {
        return await api.getProjectData(projectId);
      } catch (error) {
        if (error instanceof Error) {
          setError(`Failed to load tasks: ${error.message}`);
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep data longer in cache for offline use
    retryOnMount: true, // Always retry when component remounts
    retry: 3, // More retries for better network resilience
    structuralSharing: defaultQueryOptions.structuralSharing,
  });
};

// Mutation Hooks
// ----------------

/**
 * Project Mutations
 */

/**
 * Hook for creating a new project
 * @returns Mutation object for creating projects
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: (newProject: Partial<Project>) => api.createProject(newProject),
    ...defaultMutationOptions,
    onSuccess: (createdProject) => {
      // Invalidate projects list to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });

      // Add the new project to the cache to avoid refetching
      queryClient.setQueryData(
        QUERY_KEYS.projects.byId(createdProject.id),
        createdProject
      );
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to create project: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for updating an existing project
 * @returns Mutation object for updating projects
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: ({
      projectId,
      project,
    }: {
      projectId: string;
      project: Partial<Project>;
    }) => api.updateProject(projectId, project),
    ...defaultMutationOptions,
    onSuccess: (updatedProject, variables) => {
      // Update project in cache
      queryClient.setQueryData(
        QUERY_KEYS.projects.byId(variables.projectId),
        updatedProject
      );

      // Invalidate specific project data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.data(variables.projectId),
      });

      // Invalidate all projects list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.all,
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to update project: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for deleting a project
 * @returns Mutation object for deleting projects
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    ...defaultMutationOptions,
    onSuccess: (_, projectId) => {
      // Remove project data from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.projects.byId(projectId),
      });

      queryClient.removeQueries({
        queryKey: QUERY_KEYS.projects.data(projectId),
      });

      // Remove tasks related to this project
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.tasks.all(projectId),
      });

      // Invalidate projects list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.all,
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to delete project: ${error.message}`);
      }
    },
  });
};

/**
 * Task Mutations
 */

/**
 * Hook for creating a new task
 * @returns Mutation object for creating tasks
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: (newTask: Partial<Task>) => api.createTask(newTask),
    ...defaultMutationOptions,
    onSuccess: (result) => {
      if (result && result.projectId) {
        // Invalidate the project data to refresh tasks
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.data(result.projectId),
        });

        // Also invalidate the project's task list
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasks.all(result.projectId),
        });

        // Update the active tasks list if available
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasks.active(result.projectId),
        });
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to create task: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for updating an existing task
 * @returns Mutation object for updating tasks
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: ({ taskId, task }: { taskId: string; task: Partial<Task> }) =>
      api.updateTask(taskId, task),
    ...defaultMutationOptions,
    onSuccess: (result) => {
      if (result && result.projectId) {
        // Update the task data in cache
        queryClient.setQueryData(
          QUERY_KEYS.tasks.byId(result.projectId, result.id),
          result
        );

        // Invalidate project data and task lists
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.projects.data(result.projectId),
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tasks.all(result.projectId),
        });

        // Handle status-specific queries
        if (result.status === 2) {
          // Completed
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.tasks.completed(result.projectId),
          });
        } else {
          // Active
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.tasks.active(result.projectId),
          });
        }
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to update task: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for completing a task with optimistic updates for better TUI responsiveness
 * @returns Mutation object for completing tasks
 */
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => api.completeTask(projectId, taskId),
    ...defaultMutationOptions,
    onMutate: async ({ projectId, taskId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.projects.data(projectId),
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<ProjectData>(
        QUERY_KEYS.projects.data(projectId)
      );

      // Optimistically update to the new value
      if (previousData) {
        const now = new Date();

        // Create an updated copy
        const updatedData = {
          ...previousData,
          tasks: previousData.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: 2, completedTime: now }
              : task
          ),
        };

        // Update the query data
        queryClient.setQueryData(
          QUERY_KEYS.projects.data(projectId),
          updatedData
        );
      }

      // Return the previous state for potential rollback
      return { previousData };
    },
    onError: (err, { projectId }, context) => {
      // Roll back to the previous state if available
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.projects.data(projectId),
          context.previousData
        );
      }

      if (err instanceof Error) {
        setError(`Failed to complete task: ${err.message}`);
      }
    },
    onSettled: (_, __, { projectId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.data(projectId),
      });

      // Also refresh task-specific queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.active(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.completed(projectId),
      });
    },
  });
};

/**
 * Hook for deleting a task
 * @returns Mutation object for deleting tasks
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => api.deleteTask(projectId, taskId),
    ...defaultMutationOptions,
    onSuccess: (_, variables) => {
      // Remove the task from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.tasks.byId(variables.projectId, variables.taskId),
      });

      // Invalidate project data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.data(variables.projectId),
      });

      // Invalidate task lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.all(variables.projectId),
      });

      // Invalidate status-specific lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.active(variables.projectId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.completed(variables.projectId),
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to delete task: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for completing multiple tasks at once
 * Useful for terminal UIs with batch operations
 */
export const useCompleteMultipleTasks = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: async ({
      projectId,
      taskIds,
    }: {
      projectId: string;
      taskIds: string[];
    }) => {
      // Execute all task completions in parallel
      return Promise.all(
        taskIds.map((taskId) => api.completeTask(projectId, taskId))
      );
    },
    ...defaultMutationOptions,
    // Skip individual optimistic updates and just do one update at the end
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.data(projectId),
      });

      // Also refresh task-specific queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.active(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.completed(projectId),
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to complete multiple tasks: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for deleting multiple tasks at once
 * Useful for terminal UIs with batch operations
 */
export const useDeleteMultipleTasks = () => {
  const queryClient = useQueryClient();
  const setError = useAppStore((state) => state.setError);

  return useMutation({
    mutationFn: async ({
      projectId,
      taskIds,
    }: {
      projectId: string;
      taskIds: string[];
    }) => {
      // Execute all task deletions in parallel
      return Promise.all(
        taskIds.map((taskId) => api.deleteTask(projectId, taskId))
      );
    },
    ...defaultMutationOptions,
    onSuccess: (_, { projectId }) => {
      // Invalidate project data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.data(projectId),
      });

      // Invalidate task lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.active(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.tasks.completed(projectId),
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(`Failed to delete multiple tasks: ${error.message}`);
      }
    },
  });
};

/**
 * Hook for checking loading states across multiple mutations
 * Useful for TUI keyboard shortcut handling and loading indicators
 */
export const useLoadingState = () => {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const completeMultipleTasks = useCompleteMultipleTasks();
  const deleteMultipleTasks = useDeleteMultipleTasks();

  return {
    isLoading:
      createProject.isPending ||
      updateProject.isPending ||
      deleteProject.isPending ||
      createTask.isPending ||
      updateTask.isPending ||
      completeTask.isPending ||
      deleteTask.isPending ||
      completeMultipleTasks.isPending ||
      deleteMultipleTasks.isPending,

    // Detailed loading states for specific UI feedback
    projectLoading:
      createProject.isPending ||
      updateProject.isPending ||
      deleteProject.isPending,

    taskLoading:
      createTask.isPending ||
      updateTask.isPending ||
      completeTask.isPending ||
      deleteTask.isPending ||
      completeMultipleTasks.isPending ||
      deleteMultipleTasks.isPending,

    // Individual mutation loading states
    createProjectLoading: createProject.isPending,
    updateProjectLoading: updateProject.isPending,
    deleteProjectLoading: deleteProject.isPending,
    createTaskLoading: createTask.isPending,
    updateTaskLoading: updateTask.isPending,
    completeTaskLoading: completeTask.isPending,
    deleteTaskLoading: deleteTask.isPending,
    batchTaskLoading:
      completeMultipleTasks.isPending || deleteMultipleTasks.isPending,
  };
};

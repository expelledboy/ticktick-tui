import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useAppStore } from "../store";

const QUERY_KEYS = {
  projects: ["projects"],
  projectData: (id: string) => ["projectData", id],
};

export const useRemoteProjects = () =>
  useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: () => api.getProjects(),
  });

export const useRemoteProjectData = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projectData(id),
    queryFn: () => api.getProjectData(id),
  });

/**
 * Hook for accessing and syncing projects
 */
export const useProjects = () => {
  const setError = useAppStore((state) => state.setError);

  return useQuery({
    queryKey: QUERY_KEYS.projects,
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
  });
};

/**
 * Hook for accessing and syncing tasks for a specific project
 */
export const useProjectData = (projectId: string) => {
  const setError = useAppStore((state) => state.setError);

  return useQuery({
    queryKey: QUERY_KEYS.projectData(projectId),
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
  });
};

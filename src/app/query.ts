import { useQuery } from "@tanstack/react-query";
import { api } from "../ticktick/api";

const QUERY_KEYS = {
  projects: ["projects"],
  projectData: (id: string) => ["projectData", id],
};

export const useProjects = () =>
  useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: () => api.getProjects(),
  });

export const useProjectData = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projectData(id),
    queryFn: () => api.getProjectData(id),
  });

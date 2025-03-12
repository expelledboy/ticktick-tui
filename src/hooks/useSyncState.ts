/**
 * Sync react query state with zustand store
 */

import { useQueryClient, type Query } from "@tanstack/react-query";
import { useAppStore } from "../store";
import { useEffect } from "react";
import { useProjects } from "../ticktick/useReactQuery";
import type { Project, ProjectData } from "../core/types";

export const useSyncState = () => {
  const queryClient = useQueryClient();
  const updateProjects = useAppStore((s) => s.updateProjects);
  const updateProjectData = useAppStore((s) => s.updateProjectData);

  // Sync projects to Zustand store when React Query data changes
  useEffect(() => {
    // Subscribe to projects query changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Only proceed if we have a query and this is an update
      if (event.type !== "updated" || !event.query) {
        return;
      }

      const query = event.query;
      const queryKey = query.queryKey;
      const data = query.state.data;

      if (!data) return;

      // Sync data based on query key pattern
      // TODO: Hopefully we dont have to implement mutations!
      if (queryKey[0] === "projects") {
        updateProjects(data as Project[]);
      } else if (queryKey[0] === "project" && queryKey[2] === "data") {
        updateProjectData(data as ProjectData);
      }
    });

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [queryClient, updateProjects, updateProjectData]);

  // Initial sync of projects data on hook mount
  const { data: projects } = useProjects();

  useEffect(() => {
    if (projects) {
      updateProjects(projects);
    }
  }, [projects, updateProjects]);
};

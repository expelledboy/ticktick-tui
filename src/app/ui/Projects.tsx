import { useEffect } from "react";
import { useAppStore } from "../store";
import { useProjects } from "../query";
import { Box, Text } from "ink";

export const Projects = () => {
  const { data, isLoading, error } = useProjects();
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId);

  useEffect(() => {
    if (data?.length) {
      setSelectedProjectId(data[0].id);
    }
  }, [data]);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box flexDirection="column">
      <Text>Projects</Text>
      {data?.map((project) => <Text key={project.id}>{project.name}</Text>)}
    </Box>
  );
};

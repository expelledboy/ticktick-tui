import { Box, Text } from "ink";
import { useProjectData } from "../query";

export const Tasks = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, error } = useProjectData(projectId);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box flexDirection="column">
      <Text>Tasks</Text>
      {data?.tasks.map((task) => <Text key={task.id}>{task.title}</Text>)}
    </Box>
  );
};

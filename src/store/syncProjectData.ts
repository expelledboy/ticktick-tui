import type { Project, ProjectData, Task } from "../core/types";

export const syncProjectData = (
  currentProjects: Project[],
  currentTasks: Task[],
  projectData: ProjectData
) => {
  const id = projectData.project.id;

  // Update the project with new data
  const updatedProjects = currentProjects.map((project) => {
    if (project.id === id) {
      return projectData.project;
    }
    return project;
  });

  // If the project doesn't exist yet, add it
  if (!updatedProjects.some((project) => project.id === id)) {
    updatedProjects.push(projectData.project);
  }

  // Remove existing tasks for this project and add the new ones
  const tasksFromOtherProjects = currentTasks.filter(
    (task) => task.projectId !== id
  );

  // Combine tasks from other projects with the updated tasks for this project
  const updatedTasks = [...tasksFromOtherProjects, ...projectData.tasks];

  return { projects: updatedProjects, tasks: updatedTasks };
};

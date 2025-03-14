import { TaskSchema } from "../ticktick/schema";
import { type SortOrder, type Task } from "../core/types";
import { logError } from "../core/logger";
import { useMemo, useState } from "react";
import { useProjectData } from "../ticktick";

export const useSortedTasks = ({ projectId }: { projectId: string | null }) => {
  const { data: projectData } = useProjectData(projectId);

  // Get default orderBy from config
  const [orderBy, setOrderBy] = useState<SortOrder>(config.views.orderBy);

  // Sort tasks by orderBy
  const sortedTasks = useMemo(() => {
    return sortTasks(projectData?.tasks ?? [], orderBy).map((t) =>
      TaskSchema.parse(t)
    );
  }, [projectData, orderBy]);

  return {
    sortedTasks,
    orderBy,
    setOrderBy,
  };
};

const sortTasks = (
  tasks: Task[],
  orderBy: "priority" | "dueDate" | "default"
) => {
  switch (orderBy) {
    case "priority":
      return sortTasksByPriority(sortTasksByOrder(tasks)).reverse();
    case "dueDate":
      return sortTasksByDueDate(sortTasksByOrder(tasks)).reverse();
    default:
      return sortTasksByOrder(tasks);
  }
};

const sortTasksByPriority = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    return priorityA - priorityB;
  });
};

const sortTasksByDueDate = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    // TODO: Figure out way zod doesn't parse dates
    const dueDateA = new Date(a.dueDate ?? new Date());
    const dueDateB = new Date(b.dueDate ?? new Date());
    try {
      return dueDateA.getTime() - dueDateB.getTime();
    } catch (e) {
      logError("INVALID_DATA", {
        dueDateA: dueDateA.toISOString(),
        dueDateB: dueDateB.toISOString(),
        dueDateAIsDate: dueDateA instanceof Date,
        dueDateBIsDate: dueDateB instanceof Date,
        message: "dueDate is not a date",
      });
      return 0;
    }
  });
};

const sortTasksByOrder = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    if (a.sortOrder === b.sortOrder) return a.id.localeCompare(b.id);
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    return orderA - orderB;
  });
};

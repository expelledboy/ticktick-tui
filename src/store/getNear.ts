export const getNear = (
  direction: "next" | "previous",
  array: any[],
  currentId: string | null
): string | null => {
  if (!currentId) return null;
  const index = array.findIndex((item) => item.id === currentId);
  if (index === -1) return null;
  const nextIndex = Math.max(
    0,
    Math.min(array.length - 1, index + (direction === "next" ? 1 : -1))
  );
  const nextItem = array[nextIndex];
  return nextItem ? nextItem.id : null;
};

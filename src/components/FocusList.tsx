/**
 * FocusList Component
 *
 * A generic, reusable component that provides keyboard navigation and focus
 * management for any list-based interface, using the application's keybinding system.
 */
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { Box, Text, type Key } from "ink";
import { useKeyHandler } from "../keybindings";
import type { AppMode } from "../keybindings/useKeyHandler";
import { debug } from "../core/logger";

export interface RenderItemProps<T> {
  item: T;
  isFocused: boolean;
  isSelected?: boolean;
}

export interface FocusListProps<T> {
  // Core data and callbacks
  items: T[]; // The list of items to display
  onSelect?: (item: T | null) => void; // Callback when an item is selected
  selectedId?: string | null; // Currently selected item ID (optional)
  getItemId?: (item: T) => string; // Function to get unique ID from item

  // Custom rendering
  renderItem: (props: RenderItemProps<T>) => React.ReactNode;
  renderHeader?: () => React.ReactNode; // Custom header renderer
  renderEmpty?: () => React.ReactNode; // Custom empty state renderer

  // Customization
  title?: string; // Optional list title
  emptyMessage?: string; // Message to show when list is empty

  // Mode
  mode: AppMode;
}

// Utility function for comparing arrays
function shallowEqual(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Custom hook to manage focus state and navigation
function useFocusManagement<T>(
  items: T[],
  selectedId: string | null | undefined,
  getItemId: (item: T) => string
) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const firstMount = useRef(true);
  const previousItems = useRef(items);
  const previousSelectedId = useRef(selectedId);
  const [renderCount, setRenderCount] = useState(0);

  // Reset focused index when items or selection changes
  useEffect(() => {
    if (items.length === 0) return;

    const itemsChanged = !shallowEqual(previousItems.current, items);
    const selectedIdChanged = previousSelectedId.current !== selectedId;

    // Update refs for next comparison
    previousItems.current = items;
    previousSelectedId.current = selectedId;

    // Only proceed if this is the first mount or if data actually changed
    if (!firstMount.current && !itemsChanged && !selectedIdChanged) {
      return;
    }

    // If we have a selectedId, try to focus that item
    if (selectedId) {
      const selectedIndex = items.findIndex(
        (item) => getItemId(item) === selectedId
      );
      if (selectedIndex !== -1) {
        setFocusedIndex(selectedIndex);
        firstMount.current = false;
        return;
      }
    }

    // Set first mount to false after initial run
    if (firstMount.current) {
      firstMount.current = false;
    }

    // Otherwise focus the first item only on initial mount or when data actually changes
    if (firstMount.current || itemsChanged) {
      setFocusedIndex(0);
    }
  }, [items, selectedId, getItemId]);

  // Navigation functions - memoized
  const navigate = useCallback(
    (action: string) => {
      if (items.length === 0) return;

      switch (action) {
        case "up":
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "down":
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
      }

      // Force a re-render
      setRenderCount((c) => (c + 1) % 1000);
    },
    [items.length]
  );

  return { focusedIndex, navigate };
}

function FocusList<T>({
  items,
  onSelect,
  selectedId,
  getItemId = (item: any) => item.id,
  renderItem,
  renderHeader,
  renderEmpty,
  title,
  emptyMessage = "No items found",
  mode,
}: FocusListProps<T>) {
  // Use the custom hook for focus management
  const { focusedIndex, navigate } = useFocusManagement(
    items,
    selectedId,
    getItemId
  );

  // Handle key actions
  const handleAction = useCallback(
    (actionCategory: string, action: string) => {
      if (actionCategory !== "navigation" || items.length === 0) return;

      if (action === "up" || action === "down") {
        navigate(action);
      } else if (action === "select" && onSelect && items[focusedIndex]) {
        onSelect(items[focusedIndex]);
      }
    },
    [items, focusedIndex, onSelect, navigate, mode]
  );

  // Register keyboard handler
  useKeyHandler(mode, handleAction);

  // Helper function to render the header
  const renderHeaderContent = useCallback(() => {
    if (renderHeader) return renderHeader();
    if (title)
      return (
        <Box paddingLeft={1}>
          <Text bold underline>
            {title}
          </Text>
        </Box>
      );
    return null;
  }, [renderHeader, title, items.length]);

  // Render empty state if no items
  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        {renderHeaderContent()}
        {renderEmpty ? (
          renderEmpty()
        ) : (
          <Box marginTop={1}>
            <Text dimColor>{emptyMessage}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Render list with focused items
  return (
    <Box flexDirection="column" overflow="hidden">
      {renderHeaderContent()}
      <Box flexDirection="column" marginTop={1}>
        {items.map((item, index) => (
          <Box key={getItemId(item)}>
            {renderItem({
              item,
              isFocused: focusedIndex === index,
              isSelected: selectedId
                ? getItemId(item) === selectedId
                : undefined,
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Export a memoized version to avoid unnecessary re-renders
export default memo(FocusList) as typeof FocusList;

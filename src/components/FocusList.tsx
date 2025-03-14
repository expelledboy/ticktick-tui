/**
 * FocusList Component
 *
 * A minimalist but powerful component for keyboard-navigable lists in terminal UI.
 * Designed with simplicity, focused responsibility, and clear separation of concerns.
 */
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { Box, Text } from "ink";
import { type AppMode, useKeyHandler } from "../keybindings";
import { useDebugLogs } from "../hooks/useDebugLogs";
import { debug } from "../core/logger";

/**
 * Core types for the FocusList component
 */
type ItemId = string;

export interface RenderItemProps<T> {
  item: T;
  index: number;
  isFocused: boolean;
  isSelected: boolean;
}

export interface FocusListProps<T> {
  // Data
  items: T[];
  getItemId?: (item: T) => ItemId;
  selectedId?: ItemId | null;

  // Callbacks
  onSelect?: (item: T | null) => void;
  onFocusChange?: (index: number) => void;

  // Rendering
  renderItem: (props: RenderItemProps<T>) => ReactNode;

  // Keybindings mode
  mode?: AppMode;

  // Optional customization
  initialFocusIndex?: number;
  title?: string;
  emptyMessage?: string;
  renderEmpty?: () => ReactNode;
  renderContainer?: (props: { children: ReactNode }) => ReactNode;
  renderHeader?: () => ReactNode;
}

/**
 * FocusList Component
 *
 * A streamlined approach to keyboard-navigable lists with sensible defaults
 * and clean external APIs.
 */
function FocusList<T>({
  // Data
  items,
  getItemId = (item: any) => item.id,
  selectedId = null,

  // Callbacks
  onSelect,
  onFocusChange,

  // Rendering
  renderItem,
  renderEmpty,
  renderContainer,
  renderHeader,

  // Keybindings mode
  mode = "global",

  // Options
  initialFocusIndex = 0,
  title,
  emptyMessage = "No items found",
}: FocusListProps<T>) {
  // Log component lifecycle for testing
  useDebugLogs("FocusList");

  // ===== STATE =====
  // Track focus position - the core state of this component
  const [focusedIndex, setFocusedIndex] = useState(initialFocusIndex);

  // Track the last selected ID to detect external changes
  const lastSelectedIdRef = useRef<string | null>(selectedId);

  // Flag to allow navigation to break from selection sync
  const userNavigatedRef = useRef(false);

  // ===== DERIVED VALUES =====
  // Safely get the currently focused item (or null if none)
  const focusedItem =
    items.length > 0 && focusedIndex >= 0 && focusedIndex < items.length
      ? items[focusedIndex]
      : null;

  // ===== INITIAL SETUP =====
  // Handle initial focus and selection sync immediately
  useLayoutEffect(() => {
    if (items.length === 0) return;

    // Priority 1: Focus the selected item if provided
    if (selectedId) {
      const selectedIndex = items.findIndex(
        (item) => getItemId(item) === selectedId
      );
      if (selectedIndex !== -1) {
        setFocusedIndex(selectedIndex);
        return;
      }
    }

    // Priority 2: Make sure initialFocusIndex is within bounds
    if (initialFocusIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, []); // Only run on mount

  // ===== EFFECTS =====
  // EFFECT 1: Notify parent about focus changes
  useEffect(() => {
    onFocusChange?.(focusedIndex);
  }, [focusedIndex, onFocusChange]);

  // EFFECT 2: Ensure focus stays in bounds when items change
  useEffect(() => {
    if (items.length === 0) return;

    // If focus is out of bounds, reset to start
    if (focusedIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, [items, focusedIndex]);

  // EFFECT 3: Sync focus with selection ONLY when selectedId changes externally
  useEffect(() => {
    // Skip if no items
    if (items.length === 0) return;

    // Skip if user manually navigated
    if (userNavigatedRef.current) return;

    // Skip if selectedId hasn't changed
    if (selectedId === lastSelectedIdRef.current) return;

    // Update the ref to track the new selectedId
    lastSelectedIdRef.current = selectedId;

    // If we have a selected item, try to focus it
    if (selectedId) {
      const selectedIndex = items.findIndex(
        (item) => getItemId(item) === selectedId
      );
      if (selectedIndex !== -1) {
        setFocusedIndex(selectedIndex);
      }
    }
  }, [items, selectedId, getItemId]);

  // ===== HANDLERS =====
  // Handle navigation with wraparound
  const navigate = useCallback(
    (direction: "up" | "down") => {
      if (items.length === 0) return;

      // Mark that user has explicitly navigated
      userNavigatedRef.current = true;

      setFocusedIndex((prevIndex) => {
        if (direction === "up") {
          return (prevIndex - 1 + items.length) % items.length;
        } else {
          return (prevIndex + 1) % items.length;
        }
      });
    },
    [items.length]
  );

  // Handle selection
  const handleSelect = useCallback(() => {
    if (onSelect && focusedItem) {
      onSelect(focusedItem);
    }
  }, [onSelect, focusedItem]);

  // Map keys to actions
  const handleKeyAction = useCallback(
    (actionCategory: string, action: string) => {
      // Handle navigation actions
      if (actionCategory === "navigation") {
        if (action === "up" || action === "down") {
          navigate(action as "up" | "down");
        } else if (action === "select") {
          handleSelect();
        }
      }
    },
    [navigate, handleSelect]
  );

  // Connect to keyboard handler
  useKeyHandler(mode, handleKeyAction);

  // ===== RENDERING LOGIC =====
  // 1. Render header (if provided)
  const headerContent = useMemo(() => {
    if (renderHeader) return renderHeader();
    if (title) {
      return (
        <Box paddingX={1} paddingBottom={1}>
          <Text bold underline>
            {title}
          </Text>
        </Box>
      );
    }
    return null;
  }, [renderHeader, title]);

  // 3. Render items - MOVED BEFORE the conditional return
  const itemsContent = useMemo(() => {
    if (items.length === 0) return null;

    return items.map((item, index) => (
      <Box key={getItemId(item)}>
        {renderItem({
          item,
          index,
          isFocused: index === focusedIndex,
          isSelected: selectedId ? getItemId(item) === selectedId : false,
        })}
      </Box>
    ));
  }, [items, getItemId, renderItem, focusedIndex, selectedId]);

  // 2. Handle empty state - AFTER all hooks are defined
  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        {headerContent}
        {renderEmpty ? (
          renderEmpty()
        ) : (
          <Box paddingX={1}>
            <Text dimColor>{emptyMessage}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // 4. Final assembly - either use custom container or default
  if (renderContainer) {
    return (
      <Box flexDirection="column" overflow="hidden">
        {headerContent}
        {renderContainer({ children: itemsContent })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" overflow="hidden">
      {headerContent}
      <Box flexDirection="column">{itemsContent}</Box>
    </Box>
  );
}

export default FocusList;

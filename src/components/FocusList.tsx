/**
 * FocusList Component
 *
 * A minimalist but powerful component for keyboard-navigable lists in terminal UI.
 * Designed with simplicity, focused responsibility, and clear separation of concerns.
 *
 * Now with built-in scrollability for handling large lists efficiently.
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
  // -- Data

  /**
   * Array of items to render in the list
   * The component will render each item using the renderItem function
   */
  items: T[];

  /**
   * Function to extract a unique ID from each item
   * Used for React keys and to match selectedId
   * @default (item) => item.id
   */
  getItemId?: (item: T) => ItemId;

  /**
   * Currently selected item ID
   * Used to apply selection styling and to initially focus the selected item
   * @default null
   */
  selectedId?: ItemId | null;

  // -- Callbacks

  /**
   * Callback fired when an item is selected (typically via Enter/Return key)
   * @param item The selected item, or null if selection is cleared
   */
  onSelect?: (item: T | null) => void;

  /**
   * Callback fired when focus changes between items
   * @param index The index of the newly focused item
   */
  onFocusChange?: (index: number) => void;

  // -- Rendering

  /**
   * Function to render each list item
   * Will receive item data, focus state, selection state, and index
   */
  renderItem: (props: RenderItemProps<T>) => ReactNode;

  // -- Keybindings mode

  /**
   * Keybinding mode to use for navigation
   * Controls which key event scope the component will respond to
   * @default "global"
   */
  mode?: AppMode;

  // -- Optional customization

  /**
   * Initial index to focus when the component mounts
   * @default 0
   */
  initialFocusIndex?: number;

  /**
   * Title text displayed above the list
   * Set to undefined for no title
   * @default undefined
   */
  title?: string;

  /**
   * Message to display when the items array is empty
   * @default "No items found"
   */
  emptyMessage?: string;

  /**
   * Custom component to render when the items array is empty
   * Takes precedence over emptyMessage if both are provided
   */
  renderEmpty?: () => ReactNode;

  /**
   * Custom container component to wrap around the list items
   * Useful for adding borders, padding, or other styling
   */
  renderContainer?: (props: { children: ReactNode }) => ReactNode;

  /**
   * Custom header component to replace the default title
   * Takes precedence over title if both are provided
   */
  renderHeader?: () => ReactNode;

  // -- Scrollability features

  /**
   * Maximum number of items to display at once
   * If items.length > maxVisibleItems, scrolling will be enabled
   * @default items.length (show all items)
   */
  maxVisibleItems?: number;

  /**
   * Whether to show a scrollbar when content overflows
   * @default true
   */
  showScrollbar?: boolean;

  /**
   * Character to use for the scrollbar track
   * @default "│"
   */
  scrollTrackChar?: string;

  /**
   * Character to use for the scrollbar thumb
   * @default "█"
   */
  scrollThumbChar?: string;

  /**
   * Color to use for the scrollbar track
   * @default "gray"
   */
  scrollTrackColor?: string;

  /**
   * Color to use for the scrollbar thumb
   * @default "blue"
   */
  scrollThumbColor?: string;
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

  // Scrollability options
  maxVisibleItems,
  showScrollbar = true,
  scrollTrackChar = "│",
  scrollThumbChar = "█",
  scrollTrackColor = "gray",
  scrollThumbColor = "blue",
}: FocusListProps<T>) {
  // Log component lifecycle for testing
  useDebugLogs("FocusList");

  // ===== STATE =====
  // Track focus position - the core state of this component
  const [focusedIndex, setFocusedIndex] = useState(initialFocusIndex);

  // Track window position for scrollability
  const [windowStart, setWindowStart] = useState(0);

  // Track the last selected ID to detect external changes
  const lastSelectedIdRef = useRef<string | null>(selectedId);

  // Flag to allow navigation to break from selection sync
  const userNavigatedRef = useRef(false);

  // ===== DERIVED VALUES =====
  // Determine how many items to display at once based on maxVisibleItems
  const effectiveMaxVisibleItems = useMemo(() => {
    if (maxVisibleItems === undefined) return items.length; // Show all items if not specified
    return Math.min(maxVisibleItems, items.length); // Never show more than we have
  }, [maxVisibleItems, items.length]);

  // Calculate whether scrolling is needed
  const needsScrolling = items.length > effectiveMaxVisibleItems;

  // Get only the visible slice of items
  const visibleItems = useMemo(() => {
    return items.slice(windowStart, windowStart + effectiveMaxVisibleItems);
  }, [items, windowStart, effectiveMaxVisibleItems]);

  // Calculate the relative focus index within the visible window
  const relativeFocusIndex = Math.max(
    0,
    Math.min(visibleItems.length - 1, focusedIndex - windowStart)
  );

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

        // Also set the window position to ensure selected item is visible
        if (maxVisibleItems !== undefined && selectedIndex >= maxVisibleItems) {
          const newWindowStart = Math.max(
            0,
            selectedIndex - Math.floor(maxVisibleItems / 2)
          );
          setWindowStart(newWindowStart);
        }
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
      setWindowStart(0);
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

        // Also adjust window position to ensure selected item is visible
        if (maxVisibleItems !== undefined) {
          if (selectedIndex < windowStart) {
            setWindowStart(selectedIndex);
          } else if (selectedIndex >= windowStart + effectiveMaxVisibleItems) {
            setWindowStart(selectedIndex - effectiveMaxVisibleItems + 1);
          }
        }
      }
    }
  }, [
    items,
    selectedId,
    getItemId,
    windowStart,
    effectiveMaxVisibleItems,
    maxVisibleItems,
  ]);

  // EFFECT 4: Adjust window position when focus changes
  useEffect(() => {
    // Skip if no scrollability or no items
    if (maxVisibleItems === undefined || items.length === 0) return;

    // If focus is before window start, adjust window upward
    if (focusedIndex < windowStart) {
      setWindowStart(focusedIndex);
    }
    // If focus is after window end, adjust window downward
    else if (focusedIndex >= windowStart + effectiveMaxVisibleItems) {
      setWindowStart(focusedIndex - effectiveMaxVisibleItems + 1);
    }
  }, [
    focusedIndex,
    windowStart,
    effectiveMaxVisibleItems,
    maxVisibleItems,
    items.length,
  ]);

  // ===== HANDLERS =====
  // Handle navigation with scrolling
  const navigate = useCallback(
    (direction: "up" | "down") => {
      if (items.length === 0) return;

      // Mark that user has explicitly navigated
      userNavigatedRef.current = true;

      if (direction === "up") {
        // Only update state if not already at the top boundary
        if (focusedIndex > 0) {
          const newFocusIndex = focusedIndex - 1;
          setFocusedIndex(newFocusIndex);

          // Update window position in the same render cycle if needed
          if (maxVisibleItems !== undefined && newFocusIndex < windowStart) {
            setWindowStart(newFocusIndex);
          }
        }
      } else {
        // Only update state if not already at the bottom boundary
        if (focusedIndex < items.length - 1) {
          const newFocusIndex = focusedIndex + 1;
          setFocusedIndex(newFocusIndex);

          // Update window position in the same render cycle if needed
          if (
            maxVisibleItems !== undefined &&
            newFocusIndex >= windowStart + effectiveMaxVisibleItems
          ) {
            setWindowStart(newFocusIndex - effectiveMaxVisibleItems + 1);
          }
        }
      }
    },
    [
      items.length,
      focusedIndex,
      windowStart,
      maxVisibleItems,
      effectiveMaxVisibleItems,
    ]
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

  // We can keep this effect as a safety net for other cases
  // where focus might change outside of navigate()
  useEffect(() => {
    // Skip if no scrollability or no items
    if (maxVisibleItems === undefined || items.length === 0) return;

    // If focus is before window start, adjust window upward
    if (focusedIndex < windowStart) {
      setWindowStart(focusedIndex);
    }
    // If focus is after window end, adjust window downward
    else if (focusedIndex >= windowStart + effectiveMaxVisibleItems) {
      setWindowStart(focusedIndex - effectiveMaxVisibleItems + 1);
    }
  }, [
    focusedIndex,
    windowStart,
    effectiveMaxVisibleItems,
    maxVisibleItems,
    items.length,
  ]);

  // ===== RENDERING FUNCTIONS =====
  // Render a vertical scrollbar
  const renderScrollbar = useCallback(() => {
    if (!needsScrolling) return null;

    // Calculate scrollbar dimensions and position
    const totalItems = items.length;

    // Calculate the size of the thumb as a proportion of the viewport
    const viewportRatio = effectiveMaxVisibleItems / totalItems;
    const thumbSize = Math.max(
      1,
      Math.floor(effectiveMaxVisibleItems * viewportRatio)
    );

    // Calculate how far down the thumb should be positioned
    const scrollRange = totalItems - effectiveMaxVisibleItems;
    const scrollRatio = scrollRange > 0 ? windowStart / scrollRange : 0;
    const thumbPosition = Math.floor(
      scrollRatio * (effectiveMaxVisibleItems - thumbSize)
    );

    // Create the scrollbar characters array
    const scrollbarChars = Array(effectiveMaxVisibleItems).fill(
      scrollTrackChar
    );

    // Place the thumb
    for (
      let i = 0;
      i < thumbSize && thumbPosition + i < scrollbarChars.length;
      i++
    ) {
      scrollbarChars[thumbPosition + i] = scrollThumbChar;
    }

    return (
      <Box flexDirection="column" marginRight={1}>
        {scrollbarChars.map((char, i) => (
          <Text
            key={i}
            color={
              char === scrollThumbChar ? scrollThumbColor : scrollTrackColor
            }
          >
            {char}
          </Text>
        ))}
      </Box>
    );
  }, [
    needsScrolling,
    items.length,
    effectiveMaxVisibleItems,
    windowStart,
    scrollTrackChar,
    scrollThumbChar,
    scrollTrackColor,
    scrollThumbColor,
  ]);

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

  // 3. Render items
  const itemsContent = useMemo(() => {
    if (visibleItems.length === 0) return null;

    return visibleItems.map((item, index) => {
      const absoluteIndex = windowStart + index;
      return (
        <Box key={getItemId(item)}>
          {renderItem({
            item,
            index: absoluteIndex,
            isFocused: absoluteIndex === focusedIndex,
            isSelected: selectedId ? getItemId(item) === selectedId : false,
          })}
        </Box>
      );
    });
  }, [
    visibleItems,
    windowStart,
    getItemId,
    renderItem,
    focusedIndex,
    selectedId,
  ]);

  // 2. Handle empty state
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
  const scrollableContent = (
    <Box flexDirection="row">
      {/* Scrollbar - always on the right side */}
      {showScrollbar && needsScrolling && renderScrollbar()}

      {/* Main content */}
      <Box flexDirection="column">{itemsContent}</Box>
    </Box>
  );

  if (renderContainer) {
    return (
      <Box flexDirection="column" overflow="hidden">
        {headerContent}
        {renderContainer({ children: scrollableContent })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" overflow="hidden">
      {headerContent}
      {scrollableContent}
    </Box>
  );
}

export default FocusList;

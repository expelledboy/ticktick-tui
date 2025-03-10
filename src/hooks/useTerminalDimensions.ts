import { useState, useEffect, useRef } from "react";
import { useStdout } from "ink";

/**
 * Hook to get and subscribe to terminal dimensions
 * Returns the current width and height of the terminal
 * Throttles resize events to prevent excessive re-renders
 */
export const useTerminalDimensions = () => {
  const { stdout } = useStdout();
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [dimensions, setDimensions] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });

  useEffect(() => {
    const handleResize = () => {
      // Skip update if dimensions haven't changed
      if (
        dimensions.width === stdout.columns &&
        dimensions.height === stdout.rows
      ) {
        return;
      }

      // Throttle updates to prevent frequent re-renders
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }

      throttleTimeoutRef.current = setTimeout(() => {
        setDimensions({
          width: stdout.columns,
          height: stdout.rows,
        });
        throttleTimeoutRef.current = null;
      }, 100); // Throttle
    };

    // Set initial dimensions
    handleResize();

    // Subscribe to resize events
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
      // Clear any pending throttle timeout
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [stdout, dimensions.width, dimensions.height]);

  return dimensions;
};

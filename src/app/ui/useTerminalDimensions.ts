import { useState, useEffect } from "react";
import { useStdout } from "ink";

/**
 * Hook to get and subscribe to terminal dimensions
 * Returns the current width and height of the terminal
 */
export const useTerminalDimensions = () => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: stdout.columns,
        height: stdout.rows,
      });
    };

    // Set initial dimensions
    handleResize();

    // Subscribe to resize events
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return dimensions;
};

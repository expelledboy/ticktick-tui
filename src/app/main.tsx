import { render } from "ink";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { App } from "./App";
import { logError } from "../core/logger";
import { localStorage } from "../utils/localStorage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Main entry point for the application
 */

export const runApp = async () => {
  const app = render(
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createSyncStoragePersister({
          storage: localStorage,
        }),
      }}
    >
      <App />
    </PersistQueryClientProvider>
  );

  /**
   * Handle exit
   */
  await app.waitUntilExit().then(async () => {
    // Ensure all data is saved, but don't wait forever
    const startTime = Date.now();
    const timeout = 3000; // 3 seconds timeout

    // TODO: Figure out why this doesn't work
    // Clear the screen
    app.clear();

    while (queryClient.isMutating()) {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        logError("APP_EXIT", {
          error: "timeout_waiting_for_mutations",
          timeout_ms: timeout,
        });

        // Give the user a chance to see the error message
        await sleep(1000);

        break;
      }

      // Wait for the next tick
      await sleep(100);
    }

    // Ensure process exits
    process.exit(0);
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import { render } from "ink";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { App } from "./ui/App";
import { storage } from "./state";
import { logError } from "../logger";

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
          storage: storage,
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

    while (queryClient.isMutating()) {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        logError("Timeout waiting for mutations to complete. Forcing exit...");
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Ensure process exits
    process.exit(0);
  });
};

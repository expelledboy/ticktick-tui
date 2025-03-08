import { render } from "ink";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { App } from "./ui/App";
import { storage } from "./state";

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
  await app.waitUntilExit().then(() => {
    // TODO: Ensure all data is saved
  });
};

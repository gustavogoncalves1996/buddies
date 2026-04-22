import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Generous defaults so cached data is shown instantly while we
      // revalidate in the background — perfect for offline-first.
      staleTime: 1000 * 60 * 5,           // 5 min
      gcTime: 1000 * 60 * 60 * 24 * 7,    // 7 days (must be >= persist max age)
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: "offlineFirst",        // serve cache when offline
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "buddies-query-cache-v1",
  throttleTime: 1000,
});

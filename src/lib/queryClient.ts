import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // gcTime MUST be >= persister maxAge for OFFL-01 to work across sessions
      // Without this, cache is garbage-collected after 5 minutes (default), defeating persistence
      gcTime: 1000 * 60 * 60 * 24,   // 24 hours
      staleTime: 1000 * 30,           // Show stale, then refetch after 30s
      retry: 2,
    },
  },
})

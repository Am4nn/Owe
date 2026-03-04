import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import type { UseQueryResult } from '@tanstack/react-query'

interface QueryGuardProps<T> {
  query: UseQueryResult<T>
  children: (data: T) => React.ReactNode
}

export function QueryGuard<T>({ query, children }: QueryGuardProps<T>) {
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }
  if (query.isError) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Text className="text-white text-lg font-semibold mb-2">Failed to load</Text>
        <Text className="text-white/50 text-sm text-center mb-4">
          {query.error instanceof Error ? query.error.message : 'Something went wrong'}
        </Text>
        <TouchableOpacity onPress={() => query.refetch()} className="bg-brand-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }
  if (!query.data) return null
  return <>{children(query.data)}</>
}

import { Platform } from 'react-native'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

// MMKV is native-only — use localStorage on web
const buildStorage = () => {
  if (Platform.OS === 'web') {
    return {
      setItem: (key: string, value: string): Promise<void> => {
        localStorage.setItem(key, value)
        return Promise.resolve()
      },
      getItem: (key: string): Promise<string | null> => {
        return Promise.resolve(localStorage.getItem(key))
      },
      removeItem: (key: string): Promise<void> => {
        localStorage.removeItem(key)
        return Promise.resolve()
      },
    }
  }

  // Native: MMKV (fast synchronous storage)
  const { MMKV } = require('react-native-mmkv')
  const storage = new MMKV()
  return {
    setItem: (key: string, value: string): Promise<void> => {
      storage.set(key, value)
      return Promise.resolve()
    },
    getItem: (key: string): Promise<string | null> => {
      const value = storage.getString(key)
      return Promise.resolve(value === undefined ? null : value)
    },
    removeItem: (key: string): Promise<void> => {
      storage.delete(key)
      return Promise.resolve()
    },
  }
}

export const persister = createAsyncStoragePersister({ storage: buildStorage() })

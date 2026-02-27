import { MMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const storage = new MMKV()

// MMKV is synchronous natively; we wrap in Promise for the async persister interface
const mmkvStorage = {
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

export const persister = createAsyncStoragePersister({ storage: mmkvStorage })

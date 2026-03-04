import { createMMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const storage = createMMKV()
const asyncStorage = {
  setItem: (key: string, value: string) => { storage.set(key, value); return Promise.resolve() },
  getItem: (key: string) => Promise.resolve(storage.getString(key) ?? null),
  removeItem: (key: string) => { storage.remove(key); return Promise.resolve() },
}

export const persister = createAsyncStoragePersister({ storage: asyncStorage })

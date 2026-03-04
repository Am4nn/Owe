import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const asyncStorage = {
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve() },
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve() },
}

export const persister = createAsyncStoragePersister({ storage: asyncStorage })

import { app } from './app'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

export const storage = getStorage(app)

// connect to emulator in dev environment
if (import.meta.env.DEV) {
  connectStorageEmulator(storage, 'localhost', 9199)
}

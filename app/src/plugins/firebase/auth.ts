import { app } from './app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

export const auth = getAuth(app)
auth.languageCode = 'en' // for the emails language

// connect to emulator in dev environment
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

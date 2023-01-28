import { app } from './app'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
} from 'firebase/firestore'

export const db = getFirestore(app)

// connect to emulator in dev environment
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

// set global collections
export const usersCollection = collection(db, 'users')

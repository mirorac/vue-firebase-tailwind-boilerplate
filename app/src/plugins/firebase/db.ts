import type { LinkedUsers, User } from '~/types/users'
import { app } from './app'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  type FirestoreDataConverter,
  type DocumentData,
} from 'firebase/firestore'
import type { AcquiredQuestionBundle } from '~/types/questions'

export const db = getFirestore(app)

// connect to emulator in dev environment
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export const defaultConverter: FirestoreDataConverter<DocumentData> = {
  fromFirestore(snapshot, options) {
    return {
      id: snapshot.id,
      ...snapshot.data(options),
    }
  },

  toFirestore(source) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = source
    return data
  },
}

// set global collections
export const usersCollection = collection(db, 'users').withConverter(
  defaultConverter as FirestoreDataConverter<User>
)
export const userLinksCollection = collection(db, 'user_links').withConverter(
  defaultConverter as FirestoreDataConverter<LinkedUsers>
)
export const linkCodesCollection = collection(db, 'link_codes').withConverter(
  defaultConverter as FirestoreDataConverter<{ user: string }>
)
export const acquiredBundlesCollection = collection(
  db,
  'acquired_bundles'
).withConverter(
  defaultConverter as FirestoreDataConverter<AcquiredQuestionBundle>
)

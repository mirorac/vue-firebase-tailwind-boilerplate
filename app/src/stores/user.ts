import { until } from '@vueuse/core'
import { defineStore } from 'pinia'
import {
  usersCollection,
  userLinksCollection,
  linkCodesCollection,
} from '~/plugins/firebase/db'
import { computed, ref, shallowRef } from 'vue'
import type { User, LinkedUsers } from '~/types/users'
import {
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { auth } from '@/plugins/firebase/auth'
import {
  signOut as authSignOut,
  type IdTokenResult,
  type ParsedToken,
  type User as UserAuth,
} from 'firebase/auth'

type UserLinkSyncState = {
  syncStarted: boolean
  dataRetrieved: boolean
  stopSyncCallback: null | ReturnType<typeof onSnapshot>
}

// Create the store
export const useUserStore = defineStore('userStore', () => {
  // State
  const auth = ref({
    user: null,
    claims: null,
    stopSyncCallback: null,
    syncedAtLeastOnce: false,
  })
  const user = ref<User | null>(null)
  const id = computed(() => user.value?.id)
  const userLink = ref<LinkedUsers | null>(null)
  const userLinkSyncState = ref<UserLinkSyncState>({
    syncStarted: false,
    dataRetrieved: false,
    stopSyncCallback: null,
  })
  const linkSyncStarted = ref(false)

  // Getters
  const isSigned = computed((): boolean => {
    return user.value !== null
  })

  const isLinked = computed((): boolean => {
    return !!userLink.value && userLink.value.users.length == 2
  })

  const data = computed((): User | null => {
    return user.value
  })

  const untilSigned = async () => {
    return until(id).toBeTruthy()
  }

  const untilLinked = async () => {
    return until(userLink).toBeTruthy()
  }

  const untilLinkStatusChecked = async () => {
    return until(linkSyncStarted).toBeTruthy()
  }

  // Actions
  const signIn = async (
    userAuth: UserAuth,
    token: IdTokenResult
  ): Promise<void> => {
    // save Firebase Auth information
    auth.value.user = userAuth
    auth.value.claims = token?.claims

    console.log('user id', userAuth.uid)

    // load user data and link to the other user
    return new Promise((resolve) => {
      auth.value.stopSyncCallback = onSnapshot(
        doc(usersCollection, userAuth.uid),
        async (document) => {
          if (document.exists()) {
            const data = document.data()
            console.log('loaded user data', data)
            if (data) {
              user.value = data as any
            }
            await syncUserLink()
            resolve()
          } else {
            const linkingCode = Math.random().toString(36).split('.')[1]
            // create a document for a new user
            setDoc(document.ref, {
              id: userAuth.uid,
              name: '',
              gender: '',
              linkingCode,
            })
            // prepare linking document
            setDoc(doc(linkCodesCollection, linkingCode), {
              user: userAuth.uid,
            })
          }
        }
      )
    })
  }

  const signOut = async (): Promise<void> => {
    // Simulate an async operation for signing out a user
    await new Promise((resolve) => setTimeout(resolve, 1))

    const stopUserDataSync = auth.value.stopSyncCallback
    if (stopUserDataSync) {
      stopUserDataSync()
    }
    user.value = null
    auth.value = {
      user: null,
      claims: null,
      stopSyncCallback: null,
      syncedAtLeastOnce: false,
    }

    stopUserLinkSync()
    console.log('user signed out')
  }

  const syncUserLink = async () => {
    return new Promise((resolve) => {
      if (!user.value) {
        throw new Error('User must be signed in.')
      }
      userLinkSyncState.value.stopSyncCallback = onSnapshot(
        query(
          userLinksCollection,
          where('users', 'array-contains', user.value.id)
        ),
        async (querySnapshot) => {
          linkSyncStarted.value = true
          if (querySnapshot.size == 1) {
            const docChange = querySnapshot.docChanges()[0]
            userLink.value = docChange.doc.data()
            console.log('loaded link data', userLink.value)
            resolve(true)
          } else if (querySnapshot.size == 0) {
            console.log('user is not linked')
            resolve(false)
          } else {
            console.error('multiple link docs!!')
          }
        }
      )
    })
  }

  const stopUserLinkSync = () => {
    userLink.value = null
    userLinkSyncState.value.syncStarted = false
    userLinkSyncState.value.dataRetrieved = false

    // remove snapshot
    const stopSync = userLinkSyncState.value.stopSyncCallback
    if (stopSync) {
      stopSync()
    }
  }

  const createLinkToUser = async (linkingCode: string) => {
    // check if already linked
    await untilLinkStatusChecked()
    if (isLinked.value) {
      throw new Error('User is already linked with somebody.')
    }

    const linkingDoc = await getDoc(doc(linkCodesCollection, linkingCode))
    if (linkingDoc.exists() && user.value) {
      const data = linkingDoc.data()
      if (data.user == user.value.id) {
        throw new Error('User cannot be linked to self.')
      }
      const create = await addDoc(userLinksCollection, {
        id: '',
        users: [data.user, user.value.id],
      })
      return true
    }
  }

  return {
    user,
    id,
    isSigned,
    isLinked,
    data,
    signIn,
    signOut,
    untilSigned,
    untilLinked,
    untilLinkStatusChecked,
    link: userLink,
    auth,
    createLinkToUser,
  }
})

type UserStore = ReturnType<typeof useUserStore>
type SignedUserStore = Omit<UserStore, 'user' | 'link' | 'id' | 'data'> & {
  id: Exclude<UserStore['id'], undefined>
  user: Exclude<UserStore['user'], null>
  link: Exclude<UserStore['link'], null>
  data: Exclude<UserStore['data'], null>
}
/**
 * A wrapper around `useUserStore` that guarantees the user is authenticated.
 *
 * This function should only be used in contexts where authentication is enforced
 * (e.g., inside protected routes). It asserts that `user` is non-null, ensuring
 * type safety when accessing user properties.
 *
 * @throws {Error} If the user is not authenticated.
 * @returns {SignedUserStore} A modified version of the user store where `user` is always defined.
 *
 * @example
 * ```ts
 * import { useSignedUserStore } from '@/stores/signedUserStore';
 *
 * const store = useSignedUserStore();
 * console.log(store.user.id); // ✅ No TypeScript warnings
 * ```
 */
export function useSignedUserStore(): SignedUserStore {
  const store = useUserStore()

  if (!store.user) {
    throw new Error('User is not authenticated!')
  }

  return store as SignedUserStore
}

/**
 * Listens on change in authentication status and invokes actions accordingly.
 */
auth.onAuthStateChanged(async (user: UserAuth | null) => {
  const userStore = useUserStore()
  if (user) {
    const token = await user.getIdTokenResult()
    await userStore.signIn(user, token)
  } else if (userStore.auth.syncedAtLeastOnce && userStore.isSigned) {
    await userStore.signOut()
  }
  userStore.auth.syncedAtLeastOnce = true
})

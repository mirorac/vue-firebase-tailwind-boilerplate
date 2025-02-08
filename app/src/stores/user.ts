import { until } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { User, LinkedUsers } from '~/types/users'

type UserLinkSyncState = {
  syncStarted: boolean
  dataRetrieved: boolean
  stopSyncCallback: null | (() => undefined)
}

// Create the store
export const useUserStore = defineStore('userStore', () => {
  // State
  const user = ref<User | null>(null)
  const id = computed(() => user.value?.id)
  const userLink = ref<LinkedUsers | null>(null)
  const userLinkSyncState = shallowRef<UserLinkSyncState>({
    syncStarted: false,
    dataRetrieved: false,
    stopSyncCallback: null,
  })

  // Getters
  const isSigned = (): boolean => {
    return user.value !== null
  }

  const isLinked = (): boolean => {
    return !!userLink.value
  }

  const data = (): User | null => {
    return user.value
  }

  const untilSigned = async () => {
    return until(id).toBeTruthy()
  }

  // Actions
  const signIn = async (newUser: User): Promise<void> => {
    // Simulate an async operation for signing in a user
    await new Promise((resolve) => setTimeout(resolve, 1))
    user.value = newUser
    syncUserLink()
    console.log('User signed', newUser)
  }

  const signOut = async (): Promise<void> => {
    // Simulate an async operation for signing out a user
    await new Promise((resolve) => setTimeout(resolve, 1))
    user.value = null
    stopUserLinkSync()
    console.log('user signed out')
  }

  const syncUserLink = async () => {
    userLinkSyncState.value.stopSyncCallback = setTimeout(() => {
      userLinkSyncState.value.syncStarted = true
      userLink.value = {
        id: 'A_B',
        users: ['A', 'B'],
      }
      userLinkSyncState.value.dataRetrieved = true
    }, 2000)
  }

  const stopUserLinkSync = () => {
    userLink.value = null
    userLinkSyncState.value.syncStarted = false
    userLinkSyncState.value.dataRetrieved = false
    clearTimeout(userLinkSyncState.value.stopSyncCallback)
  }

  const createLinkToUser = async (referralCode: string) => {
    // check if already linked
    await until(() => userLinkSyncState.value.syncStarted).toBeTruthy()
    if (isLinked()) {
      throw new Error('User is already linked with somebody.')
    }

    // check if the partner is not already linked
    function getLinkage(code: string) {}
  }

  const removeLinkToUser = async () => {
    if (!userLink.value) {
      throw new Error('User does not have a link to any other user.')
    }

    // set link as inactive
    // remove answers and shit
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
    link: userLink,
  }
})

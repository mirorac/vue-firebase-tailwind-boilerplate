// src/stores/questionBundles.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  AcquiredQuestion,
  AcquiredQuestionBundle,
  QuestionBundle,
} from '@/types/questions'
import { useSignedUserStore, useUserStore } from '@/stores/user'
import {
  addDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { acquiredBundlesCollection } from '~/plugins/firebase/db'
import type { LinkedUsers } from '~/types/users'

const staticBundles: QuestionBundle[] = [
  {
    id: '1',
    title: 'Intimacy Questions',
    description: 'Questions related to emotional and physical intimacy.',
    themes: ['intimacy'],
    questions: {
      '1': {
        id: '1',
        themes: ['intimacy'],
        type: 'open',
        text: 'What does intimacy mean to you?',
      },
      '2': {
        id: '2',
        themes: ['intimacy'],
        type: 'open',
        text: 'How do you express your feelings in a relationship?',
      },
      '3': {
        id: '3',
        themes: ['intimacy'],
        type: 'yes-maybe-no',
        text: 'Do you think emotional closeness is as important as physical closeness?',
      },
      '4': {
        id: '4',
        themes: ['intimacy'],
        type: 'yes-maybe-no',
        text: 'Would you feel comfortable sharing personal fears with a partner?',
      },
      '5': {
        id: '5',
        themes: ['intimacy'],
        type: 'open',
        text: 'What makes you feel closest to your partner?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Kinky Sex Questions',
    description:
      'Questions exploring the boundaries and desires around kinky sex.',
    themes: ['kinky sex'],
    questions: {
      '1': {
        id: '1',
        themes: ['kinky sex'],
        type: 'yes-maybe-no',
        text: 'Are you interested in experimenting with BDSM?',
      },
      '2': {
        id: '2',
        themes: ['kinky sex'],
        type: 'open',
        text: 'What types of kinky activities have you considered or tried?',
      },
      '3': {
        id: '3',
        themes: ['kinky sex'],
        type: 'yes-maybe-no',
        text: 'Do you enjoy power dynamics in intimate scenarios?',
      },
      '4': {
        id: '4',
        themes: ['kinky sex'],
        type: 'open',
        text: 'How do you define kinky sex?',
      },
      '5': {
        id: '5',
        themes: ['kinky sex'],
        type: 'yes-maybe-no',
        text: 'Would you be open to trying role-playing with your partner?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Emotional Connection Questions',
    description: 'Questions exploring emotional intimacy and connection.',
    themes: ['emotion'],
    questions: {
      '1': {
        id: '1',
        themes: ['emotion'],
        type: 'open',
        text: 'What makes you feel emotionally supported in a relationship?',
      },
      '2': {
        id: '2',
        themes: ['emotion'],
        type: 'yes-maybe-no',
        text: 'Do you believe it is important to discuss emotions openly in a relationship?',
      },
      '3': {
        id: '3',
        themes: ['emotion'],
        type: 'open',
        text: 'How do you express affection in a relationship?',
      },
      '4': {
        id: '4',
        themes: ['emotion'],
        type: 'yes-maybe-no',
        text: 'Do you feel emotionally vulnerable with your partner?',
      },
      '5': {
        id: '5',
        themes: ['emotion'],
        type: 'open',
        text: 'How do you handle emotional disagreements with your partner?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Light BDSM Questions',
    description: 'Questions related to exploring light BDSM dynamics.',
    themes: ['light bdsm'],
    questions: {
      '1': {
        id: '1',
        themes: ['light bdsm'],
        type: 'yes-maybe-no',
        text: 'Would you be interested in trying light BDSM activities?',
      },
      '2': {
        id: '2',
        themes: ['light bdsm'],
        type: 'open',
        text: 'What type of power dynamics do you find intriguing?',
      },
      '3': {
        id: '3',
        themes: ['light bdsm'],
        type: 'yes-maybe-no',
        text: 'Do you think consent is the most important factor in BDSM?',
      },
      '4': {
        id: '4',
        themes: ['light bdsm'],
        type: 'open',
        text: 'What are your thoughts on spanking in a relationship?',
      },
      '5': {
        id: '5',
        themes: ['light bdsm'],
        type: 'yes-maybe-no',
        text: 'Would you enjoy incorporating light bondage into intimacy?',
      },
    },
    createdAt: new Date().toISOString(),
  },
]

const transformToAcquiredBundle = (
  bundle: QuestionBundle,
  link: LinkedUsers
): AcquiredQuestionBundle => {
  const bundleCopy: QuestionBundle<AcquiredQuestion> = JSON.parse(
    JSON.stringify(bundle)
  )
  Object.values(bundleCopy.questions).forEach((question) => {
    question.answers = {}
  })
  return {
    bundleId: bundle.id,
    linkId: link.id,
    users: link.users,
    bundle: bundleCopy,
    createdAt: new Date().toISOString(),
  }
}

export const useQuestionBundlesStore = defineStore('questionBundles', () => {
  // init dependencies
  const user = useSignedUserStore()
  console.log('Bundles loaded for user: ', user.id)

  // State
  const bundles = ref<QuestionBundle[]>(staticBundles)
  const acquiredBundles = ref(new Map<string, AcquiredQuestionBundle>())
  const acquiredBundlesArray = computed(() =>
    Array.from(acquiredBundles.value.values())
  )

  // Actions
  const getList = (): QuestionBundle[] => {
    return bundles.value
  }

  const getBundle = (id: string): QuestionBundle | undefined => {
    return bundles.value.find((bundle) => bundle.id === id)
  }

  const isAcquired = (id: string) =>
    acquiredBundlesArray.value.some((acquired) => acquired.bundleId == id)

  const acquire = (bundle: QuestionBundle) => {
    if (!isAcquired(bundle.id)) {
      addDoc(
        acquiredBundlesCollection,
        transformToAcquiredBundle(bundle, user.link)
      )
      console.log('added questions budnle: ', bundle.id)
    }
  }

  const updateAnswer = async (
    acquiredBundleId: string,
    questionId: string,
    answer: string
  ) => {
    const bundleDoc = doc(acquiredBundlesCollection, acquiredBundleId)
    updateDoc(bundleDoc, {
      [`bundle.questions.${questionId}.answers.${user.id}`]: {
        answer,
        createdAt: serverTimestamp(),
      },
    })
  }

  const syncAcquiredBundles = async () => {
    await user.untilLinked()
    const q = query(
      acquiredBundlesCollection,
      where('linkId', '==', user.link.id)
    )
    const stopSync = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case 'added':
          case 'modified':
            acquiredBundles.value.set(change.doc.id, change.doc.data())
            break
          case 'removed':
            acquiredBundles.value.delete(change.doc.id)
        }
      })
    })
  }

  const isMatch = (a: string, b: string) =>
    (a == 'yes' && b == 'yes') ||
    (a == 'yes' && b == 'maybe') ||
    (a == 'maybe' && b == 'yes')

  /**
   * questions with matching answers within acquired bundles.
   * A match is identified when a question contains at least two identical answers.
   *
   * @returns An array of questions where at least two answers match.
   */
  const matches = computed(() => {
    return Array.from(acquiredBundles.value.values()).flatMap(
      (acquiredBundle) =>
        Object.values(acquiredBundle.bundle.questions).filter((question) =>
          Object.values(question.answers).some((answer, index, answers) =>
            answers
              .slice(index + 1)
              .some((otherAnswer) => isMatch(answer.answer, otherAnswer.answer))
          )
        )
    )
  })

  syncAcquiredBundles()

  return {
    bundles,
    acquiredBundles: acquiredBundlesArray,
    getList,
    getBundle,
    acquire,
    isAcquired,
    matches,
    updateAnswer,
  }
})

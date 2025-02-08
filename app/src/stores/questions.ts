import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  AcquiredQuestion,
  AcquiredQuestionBundle,
  Question,
} from '~/types/questions'
import { useQuestionBundlesStore } from './questionBundles'
import { storeToRefs } from 'pinia/dist/pinia'
import { useUserStore } from './user'

function notAnsweredByUser(question: AcquiredQuestion, user: string) {
  return !(user in question.answers)
}

export const useQuestionsStore = defineStore('questions', () => {
  // init dependencies
  const user = useUserStore()

  const { acquiredBundles } = storeToRefs(useQuestionBundlesStore())

  // build a question queue
  const questions = computed(() => {
    const questions: Question[] = []
    acquiredBundles.value.forEach((acquiredBundle: AcquiredQuestionBundle) => {
      questions.push(
        ...Object.values(acquiredBundle.bundle.questions).filter((q) =>
          notAnsweredByUser(q, user.id)
        )
      )
    })
    return questions
  })
  const availableQuestionsCount = computed(() => questions.value.length)

  // keep cursor state for the current session
  const currentIndex = ref<number>(0)
  const currentQuestion = computed(() =>
    questions.value.length ? questions.value[0] : null
  )

  // Actions
  const answer = (
    acquiredBundleId: string,
    acquiredQuestion: AcquiredQuestion,
    answer: string
  ) => {
    acquiredQuestion.answers[user.id] = {
      answer,
      createdAt: new Date().toISOString(),
    }
    console.log(
      `Answered: ${answer} for question: ${acquiredQuestion.text} (as user ${user.id})`
    )
    // Save the answer or handle it as needed (e.g., store it in a database)
  }
  const nextQuestion = () => {
    if (currentIndex.value < questions.value.length) {
      currentIndex.value++
    }
  }

  return {
    questions,
    currentQuestion,
    currentIndex,
    answer,
    nextQuestion,
    availableQuestionsCount,
  }
})

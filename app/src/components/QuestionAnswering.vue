<template>
  <div class="flex h-full flex-col items-center justify-center bg-gray-100">
    <!-- Large Rounded Rectangle -->
    <div
      v-if="store.currentQuestion"
      class="flex h-64 w-11/12 max-w-4xl items-center justify-center rounded-xl bg-white text-center text-2xl font-semibold text-gray-700 shadow-lg"
    >
      {{ store.currentQuestion.question.text }}
    </div>
    <div
      v-else
      class="flex h-64 w-11/12 max-w-4xl items-center justify-center rounded-xl text-center text-2xl font-semibold text-gray-700"
    >
      No more questions available!
    </div>

    <!-- Buttons -->
    <div v-if="store.currentQuestion" class="mt-8 flex space-x-6">
      <button
        @click="answerQuestion('yes')"
        class="h-16 w-16 rounded-full bg-green-500 font-bold text-white shadow-lg hover:bg-green-600"
      >
        Yes
      </button>
      <button
        @click="answerQuestion('maybe')"
        class="h-16 w-16 rounded-full bg-yellow-500 font-bold text-white shadow-lg hover:bg-yellow-600"
      >
        Maybe
      </button>
      <button
        @click="answerQuestion('no')"
        class="h-16 w-16 rounded-full bg-red-500 font-bold text-white shadow-lg hover:bg-red-600"
      >
        No
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useQuestionBundlesStore } from '@/stores/questionBundles'
  import { useQuestionsStore } from '@/stores/questions'

  const bundlesStore = useQuestionBundlesStore()
  const store = useQuestionsStore()

  const answerQuestion = (answer: string) => {
    store.answer(
      store.currentQuestion.acquiredBundle,
      store.currentQuestion.question,
      answer
    )
    store.nextQuestion()
  }
</script>

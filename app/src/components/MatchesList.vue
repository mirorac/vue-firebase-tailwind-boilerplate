<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">Questions with Matching Answers</h1>
    <div
      v-for="question in formattedMatches"
      :key="question.id"
      class="mb-2 rounded border p-3 shadow"
    >
      <p>{{ question.text }}</p>
      <div class="mt-3 border-t py-3">
        Me: {{ question.formattedAnswers.me }}, partner:
        {{ question.formattedAnswers.partner }}
      </div>
    </div>
    <div v-if="questionBundlesStore.matches.length === 0" class="text-gray-500">
      No matching questions found.
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useQuestionBundlesStore } from '~/stores/questionBundles'
  import { useSignedUserStore } from '~/stores/user'
  import type { AcquiredQuestion } from '~/types/questions'

  // Accessing the store
  const questionBundlesStore = useQuestionBundlesStore()
  const user = useSignedUserStore()

  const partnerId = user.link.users.filter((id) => id !== user.id)[0]
  function formatAnswers(answers: AcquiredQuestion['answers']) {
    return {
      me: answers[user.id].answer,
      partner: answers[partnerId].answer,
    }
  }

  // Create a computed property that adds a formattedAnswers property to each question.
  const formattedMatches = computed(() =>
    questionBundlesStore.matches.map((question) => ({
      ...question,
      formattedAnswers: formatAnswers(question.answers),
    }))
  )
</script>

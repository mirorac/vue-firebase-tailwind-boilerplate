<template>
  <div class="p-4">
    <h1 class="mb-4 text-xl font-bold">Questions with Matching Answers</h1>
    <ul>
      <li
        v-for="question in questionBundlesStore.matches"
        :key="question.id"
        class="mb-2 rounded border p-3 shadow"
      >
        {{ question.text }}
      </li>
    </ul>
    <div v-if="questionBundlesStore.matches.length === 0" class="text-gray-500">
      No matching questions found.
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useQuestionBundlesStore } from '~/stores/questionBundles'

  // Accessing the store
  const questionBundlesStore = useQuestionBundlesStore()

  // Local state
  const matchingQuestions = ref([])
</script>

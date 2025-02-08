<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">Answers</h1>
    <section
      v-for="acquired in store.acquiredBundles"
      :key="acquired.bundleId"
      class="mx-4 my-6 rounded border border-gray-300 p-4"
    >
      <header @click="toggleBundle(acquired.bundleId)" class="cursor-pointer">
        <h2 class="mb-2 text-xl font-semibold">{{ acquired.bundle.title }}</h2>
        <p class="mb-2 text-gray-700">{{ acquired.bundle.description }}</p>
        <p class="mb-4 text-sm text-gray-500">
          <strong>Themes:</strong> {{ acquired.bundle.themes.join(', ') }}
        </p>
      </header>
      <ul v-if="expandedBundles.includes(acquired.bundleId)">
        <template v-for="(q, id) in acquired.bundle.questions" :key="q.id">
          <li v-if="q.answers[user.id]" class="pt-4">
            <h3 class="font-bold">{{ q.text }}</h3>
            <p>{{ q.answers[user.id].answer }}</p>
          </li>
        </template>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useQuestionBundlesStore } from '@/stores/questionBundles'
  import { useUserStore } from '@/stores/user'

  // temporary static user ID
  const user = useUserStore()

  // Access the store
  const store = useQuestionBundlesStore()

  // State to track expanded bundles
  const expandedBundles = ref<string[]>([])

  // Toggle the visibility of a bundle
  const toggleBundle = (bundleId: string) => {
    if (expandedBundles.value.includes(bundleId)) {
      expandedBundles.value = expandedBundles.value.filter(
        (id) => id !== bundleId
      )
    } else {
      expandedBundles.value.push(bundleId)
    }
  }
</script>

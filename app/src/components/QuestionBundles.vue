<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">Question Bundles</h1>
    <ul>
      <li
        v-for="bundle in bundles"
        :key="bundle.id"
        class="my-6 rounded border border-gray-300 p-4"
      >
        <h2 class="mb-2 text-xl font-semibold">{{ bundle.title }}</h2>
        <p class="mb-2 text-gray-700">{{ bundle.description }}</p>
        <p class="mb-4 text-sm text-gray-500">
          <strong>Themes:</strong> {{ bundle.themes.join(', ') }}
        </p>
        <button
          v-if="!store.isAcquired(bundle.id)"
          @click="acquireBundle(bundle)"
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Acquire
        </button>
        <div
          v-else
          class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
        >
          Acquired
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useQuestionBundlesStore } from '@/stores/questionBundles'

  // Access the store
  const store = useQuestionBundlesStore()

  // Reactive property to hold all bundles
  const bundles = store.getList()

  // Function to acquire a bundle
  const acquireBundle = (bundle) => {
    store.acquire(bundle)
    console.log(`Acquired bundle: ${bundle.title}`)
  }
</script>

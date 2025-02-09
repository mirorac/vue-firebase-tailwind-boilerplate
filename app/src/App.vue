<template>
  <div class="flex h-dvh flex-col">
    <div>{{ user.id }} | {{ user.isLinked }}</div>
    <div class="h-[90%] overflow-y-scroll">
      <RouterView />
    </div>
    <div class="flex h-[10%] items-center justify-around">
      <RouterLink
        :to="{ name: 'answer' }"
        class="rounded-md border bg-white p-4"
        >Questions</RouterLink
      >
      <RouterLink
        :to="{ name: 'matches' }"
        class="rounded-md border bg-white p-4"
        >Matches</RouterLink
      >
      <RouterLink
        :to="{ name: 'answers' }"
        class="rounded-md border bg-white p-4"
        >Answers</RouterLink
      >
      <RouterLink
        :to="{ name: 'bundles' }"
        class="rounded-md border bg-white p-4"
        >Bundles</RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink, RouterView, useRoute } from 'vue-router'
  import { useUserStore } from '~/stores/user'

  const user = useUserStore()
</script>
<style>
  .firebase-emulator-warning {
    display: none;
  }
</style>

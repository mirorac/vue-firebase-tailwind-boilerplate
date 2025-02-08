<template>
  <!-- <QuestionAnswering></QuestionAnswering> -->
  <!-- <QuestionBundles></QuestionBundles> -->
  <div class="flex h-dvh flex-col">
    <div>
      <button @click="switchUser">switch user</button>
      {{ user.link?.id }}
    </div>
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
  import QuestionAnswering from '~/components/QuestionAnswering.vue'
  import QuestionBundles from '~/components/QuestionBundles.vue'

  import { onMounted, watch } from 'vue'
  import { watchOnce, until } from '@vueuse/core'
  import { useUserStore } from '~/stores/user'
  import { useQuestionsStore } from '~/stores/questions'
  import { useQuestionBundlesStore } from '~/stores/questionBundles'
  import { storeToRefs } from 'pinia'

  const route = useRoute()

  const user = useUserStore()
  const switchUser = () => {
    const newUser = user.id == 'A' ? 'B' : 'A'
    user.signOut()
    user.signIn({ id: newUser })
  }
</script>

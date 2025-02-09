<template>
  <div
    class="flex min-h-screen flex-row items-center justify-center bg-gray-100"
  >
    <form
      v-if="!user.isLinked"
      @submit.prevent="submitForm"
      class="w-96 rounded-lg bg-white p-6 shadow-md"
    >
      <h2 class="mb-4 text-center text-xl font-semibold">
        Enter Your Partner's Code
      </h2>

      <input
        v-model="code"
        type="text"
        placeholder="Enter code"
        class="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="mt-4 w-full rounded-md bg-blue-500 py-2 text-white transition hover:bg-blue-600"
      >
        Submit
      </button>
      <div class="pt-10">Your code is {{ user.data.linkingCode }}</div>
    </form>
    <div v-else>You are linked to {{ user.link.users }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '~/stores/user'

  const router = useRouter()
  const user = useUserStore()
  const code = ref('')
  const errorMessage = ref('')

  const submitForm = async () => {
    if (!code.value.trim()) {
      errorMessage.value = 'Code cannot be empty.'
      return
    }

    try {
      console.log('tryin to link with a value', code.value)
      await user.createLinkToUser(code.value)
      code.value = '' // Reset input after successful submission
      errorMessage.value = ''
      router.push({ name: 'bundles' })
    } catch (error) {
      console.log(error)
      errorMessage.value =
        'Failed to create user link. Please try again. ' + error.message
    }
  }
</script>

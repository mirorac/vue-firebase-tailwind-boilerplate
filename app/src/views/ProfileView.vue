<template>
  <main class="p-4">
    <h1 class="mb-4 text-2xl font-bold">Your profile</h1>
    <ul>
      <li v-for="(value, field) in profile" class="mb-4">
        <strong>{{ field }}:</strong><br />{{ value }}
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useSignedUserStore } from '~/stores/user'

  const user = useSignedUserStore()

  const profile = computed(() => ({
    ID: user.id,
    Name: user.data.name || '-',
    Gender: user.data.gender || '-',
    'Linking code': user.data.linkingCode,
    Partner: user.link.users.filter((id) => id !== user.id)[0],
  }))
</script>

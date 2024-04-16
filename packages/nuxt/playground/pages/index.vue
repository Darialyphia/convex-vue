<script setup lang="ts">
import { SignIn } from 'vue-clerk';

definePageMeta({
  name: 'Login'
});
</script>

<template>
  <div>
    <SignIn after-sign-in-url="/todos" />
  </div>
</template>

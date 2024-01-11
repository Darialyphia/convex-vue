<script setup lang="ts">
import { definePage } from 'vue-router/auto';
import EnsureAuthenticated from '@/components/convex/EnsureAuthenticated.vue';

definePage({
  name: 'Protected'
});
</script>

<template>
  <EnsureAuthenticated v-slot="{ user }">
    <div>Protected page</div>
    <pre>{{ user }}</pre>
  </EnsureAuthenticated>
</template>

<style scoped lang="postcss"></style>

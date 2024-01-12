<script setup lang="ts">
import { definePage } from 'vue-router/auto';
import EnsureAuthenticated from '@/components/EnsureAuthenticated.vue';

definePage({
  name: 'Protected'
});
</script>

<template>
  <EnsureAuthenticated v-slot="{ user }">
    <div>Protected page</div>
    <pre>What's up, {{ user.name }} ?</pre>
  </EnsureAuthenticated>
</template>

<style scoped lang="postcss"></style>

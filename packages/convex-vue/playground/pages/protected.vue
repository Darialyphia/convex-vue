<script setup lang="ts">
import { definePage } from 'vue-router/auto';
import EnsureAuthenticated from '@/components/EnsureAuthenticated.vue';

definePage({
  name: 'Protected'
});
</script>

<template>
  <EnsureAuthenticated>
    <div>Protected page</div>
  </EnsureAuthenticated>
</template>

<style scoped lang="postcss"></style>

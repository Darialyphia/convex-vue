<script setup lang="ts">
import { useConvexAuth } from '@/composables/useConvexAuth';
import { useAuth0 } from '@auth0/auth0-vue';

const { isLoading, isAuthenticated } = useConvexAuth();
const { user } = useAuth0();
</script>

<template>
  <slot v-if="user && isAuthenticated && !isLoading" :user="user" />
  <slot v-else-if="isLoading" name="loading" />
  <slot v-else-if="!isAuthenticated" name="fallback" />
</template>

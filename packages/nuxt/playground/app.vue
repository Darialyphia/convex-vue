<script setup>
import { api } from '@/convex/_generated/api';

const { data, isLoading, loadMore, isDone } = useConvexPaginatedQuery(
  api.todos.paginatedList,
  {},
  { numItems: 5 }
);
</script>
<template>
  <div>
    <pre>{{ data }}</pre>
    <button :disabled="isDone" @click="loadMore">Load next page</button>
  </div>
</template>

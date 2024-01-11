<script setup lang="ts">
import TodoList from "@/components/TodoList.vue";
</script>

<template>
  <Suspense>
    <TodoList />

    <template #fallback> Loading todos via suspense... </template>
  </Suspense>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: #112;
  color: #eee;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
}
</style>

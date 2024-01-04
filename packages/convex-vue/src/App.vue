<script setup lang="ts">
import { useConvexQuery } from "./composables";
import { api } from "@convex/_generated/api";

const { data: todos } = useConvexQuery(api.todos.list);
</script>

<template>
  <pre>{{ todos }}</pre>
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

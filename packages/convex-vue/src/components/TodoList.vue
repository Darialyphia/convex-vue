<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@api';
import { useConvexMutation } from '@/composables/useMutation';
import ConvexQuery from './convex/ConvexQuery.vue';
import ConvexPaginatedQuery from './convex/ConvexPaginatedQuery.vue';

const todo = ref('');

const inputRef = ref<HTMLInputElement>();
const { mutate: addTodo } = useConvexMutation(api.todos.add, {
  onSuccess() {
    todo.value = '';
    inputRef.value?.focus();
  }
});

const isConvexComponentDisplayed = ref(false);
const convexComponentArgs = ref({
  forceError: false
});
</script>

<template>
  <h2>Using ConvexQuery component</h2>
  <label>
    <input type="checkbox" v-model="convexComponentArgs.forceError" />
    Force query error
  </label>
  <pre>{{ convexComponentArgs }}</pre>
  <button v-if="!isConvexComponentDisplayed" @click="isConvexComponentDisplayed = true">
    Toggle component
  </button>

  <ConvexQuery v-else :query="api.todos.list" :args="convexComponentArgs">
    <template #loading>Loading todos...</template>
    <template #error="{ error }">Error: {{ error.message }}</template>
    <template #default="{ data: todos }">
      <ul>
        <li v-for="todo in todos" :key="todo._id">{{ todo.text }}</li>
      </ul>
    </template>
  </ConvexQuery>

  <h2>Using PaginatedQuery component</h2>
  <ConvexPaginatedQuery
    :query="api.todos.paginatedList"
    :args="{}"
    :options="{ numItems: 5 }"
    suspense
  >
    <template #loading>Loading todos...</template>
    <template #error="{ error }">Error: {{ error.message }}</template>
    <template #default="{ data: todos, isDone, loadMore, isLoadingMore, reset }">
      <ul>
        <li v-for="todo in todos" :key="todo._id">{{ todo.text }}</li>
      </ul>
      <p v-if="isLoadingMore">Loading next page...</p>
      <button :disabled="isDone" @click="loadMore">Load more</button>
      <button @click="reset">Reset</button>
    </template>
  </ConvexPaginatedQuery>

  <form
    @submit.prevent="
      () => {
        addTodo({ text: todo });
      }
    "
  >
    <label for="todo">What needs to be done ?</label>
    <input id="todo" v-model="todo" ref="inputRef" />
    <button>Submit</button>
  </form>
</template>

<style scoped>
form {
  display: grid;
  gap: 0.5rem;
  width: 30rem;
}

input {
  padding: 0.5rem;
}

button {
  color: var(--text-1);
}
</style>
./composables/composables

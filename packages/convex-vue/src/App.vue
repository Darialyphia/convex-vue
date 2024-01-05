<script setup lang="ts">
import { ref } from "vue";
import { api } from "../convex/_generated/api";
import { useConvexPaginatedQuery } from "./composables/usePaginatedQuery";
import { useConvexMutation } from "./composables/useMutation";

const {
  data: todos,
  loadMore,
  isDone,
} = useConvexPaginatedQuery(
  api.todos.paginatedList,
  {
    paginationOpts: {
      numItems: 5,
      cursor: null,
    },
  },
  {
    numItems: 5,
  }
);

const todo = ref("");

const inputRef = ref<HTMLInputElement>();
const { mutate: addTodo } = useConvexMutation(api.todos.add, {
  onSuccess() {
    todo.value = "";
    inputRef.value?.focus();
  },
});
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo._id">{{ todo.text }}</li>
  </ul>
  <button :disabled="isDone" @click="loadMore">Load more</button>
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

form {
  display: grid;
  gap: 0.5rem;
  width: 30rem;
}

input {
  padding: 0.5rem;
}
</style>
./composables/composables

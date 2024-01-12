<script setup lang="ts">
import { ref } from 'vue';
import { definePage } from 'vue-router/auto';
import { useConvexMutation } from '@/composables/useMutation';
import { api } from '@api';
import ConvexPaginatedQuery from '@/components/ConvexPaginatedQuery.vue';
import ConvexQuery from '@/components/ConvexQuery.vue';

// import { useRouteLoader } from '@/composables/useRouteLoader';
// import { Loaders } from '../loaders';

definePage({
  name: 'Home'
});

// const {
//   todos: { data: todos, isLoading }
// } = useRouteLoader<Loaders['Home']>();

const todo = ref('');

const inputRef = ref<HTMLInputElement>();
const { mutate: addTodo } = useConvexMutation(api.todos.add, {
  onSuccess() {
    todo.value = '';
    inputRef.value?.focus();
  }
});
</script>

<template>
  <div class="page">
    <section>
      <h2>Using route loader</h2>

      <ConvexQuery :query="api.todos.list" :args="{}">
        <template #loading>
          <div>Loading todos...</div>
        </template>

        <template #default="{ data: todos }">
          <ul>
            <li v-for="todo in todos" :key="todo._id">{{ todo.text }}</li>
          </ul>
        </template>
      </ConvexQuery>
    </section>

    <section>
      <h2>Using PaginatedQuery component</h2>
      <ConvexPaginatedQuery
        :query="api.todos.paginatedList"
        :args="{}"
        :options="{ numItems: 5 }"
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
    </section>

    <form
      @submit.prevent="
        () => {
          addTodo({ text: todo });
        }
      "
    >
      <h2>Add todo</h2>
      <label for="todo">What needs to be done ?</label>
      <input id="todo" v-model="todo" ref="inputRef" />
      <button>Submit</button>
    </form>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--size-2);
}

form {
  display: grid;
  gap: 0.5rem;
  width: 30rem;
  grid-column: 1 / -1;
}

input {
  padding: 0.5rem;
}

button {
  color: var(--text-1);

  & + button {
    margin-inline-start: var(--size-3);
  }
}

h2 {
  font-size: var(--font-size-3);
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { defineRouteLoader, useConvexMutation } from '@convex-vue/core';

definePageMeta({
  middleware: ['auth'],
  loader: defineRouteLoader({
    todos: {
      query: api.todos.list,
      args() {
        return {};
      }
    },
    paginatedTodos: {
      query: api.todos.paginatedList,
      args() {
        return {
          paginationOpts: {
            numItems: 5,
            cursor: null
          }
        };
      }
    }
  })
});

const todo = ref('');
const inputRef = ref<HTMLInputElement>();

const { mutate: addTodo } = useConvexMutation(api.todos.add, {
  onSuccess() {
    todo.value = '';
    inputRef.value?.focus();
  },
  optimisticUpdate(ctx) {
    const current = ctx.getQuery(api.todos.list, {});
    if (!current) return;

    ctx.setQuery(api.todos.list, {}, [
      {
        _creationTime: Date.now(),
        _id: 'optimistic_id' as Id<'todos'>,
        completed: false,
        text: 'Some dummy text'
      },
      ...current
    ]);
  }
});
</script>

<template>
  <div class="page">
    <section>
      <h2>Using route loader</h2>

      <ConvexQuery :query="api.todos.list" :args="{}">
        <template #loading>Loading todos...</template>

        <template #default="{ data: todos }">
          <ul>
            <li v-for="todo in todos" :key="todo._id">
              <Todo :todo="todo" />
            </li>
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
        <template #default="{ data: todos, isDone, loadMore, isLoadingMore, reset }">
          <ul>
            <li v-for="todo in todos" :key="todo._id">
              <Todo :todo="todo" />
            </li>
          </ul>
          <p v-if="isLoadingMore">Loading next page...</p>

          <footer>
            <button :disabled="isDone" @click="loadMore">Load more</button>
            <button @click="reset">Reset</button>
          </footer>
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
      <input id="todo" ref="inputRef" v-model="todo" />
      <button>Submit</button>
    </form>
  </div>
</template>

<style scoped lang="postcss">
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
}

footer {
  display: flex;
  gap: var(--size-3);
  margin-block-start: var(--size-2);
}

h2 {
  font-size: var(--font-size-3);
}

ul {
  list-style: none;
  padding: 0;

  > li li {
    margin-block: var(--size-2);
    max-inline-size: 200%;
  }
}
</style>

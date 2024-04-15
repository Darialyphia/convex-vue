<script setup lang="ts">
import { ref } from 'vue';
import { api } from './convex/_generated/api';
import type { Id } from './convex/_generated/dataModel';
import { useConvexMutation } from '@convex-vue/core';
// import { useRouteLoader } from '@/composables/useRouteLoader';
// import { Loaders } from '../loaders';

// const { paginatedTodos } = useRouteLoader<Loaders['Home']>();

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
  <header>
    <ConvexLink to="/">Home</ConvexLink>
    <ConvexLink to="/todos">Todos</ConvexLink>
  </header>
  <main>
    <NuxtPage />
  </main>
</template>

<style lang="postcss">
@import 'open-props/postcss/style';
@import 'open-props/postcss/normalize';
@import 'open-props/postcss/buttons';

:root {
  --text-1: var(--gray-0);
  --text-2: var(--gray-1);
  --text-3: var(--gray-2);

  --surface-1: var(--gray-9);
  --surface-2: var(--gray-10);
  --surface-3: var(--gray-11);
}

body {
  background-color: var(--surface-1);
  max-width: var(--size-xl);
  margin-inline: auto;
}

:is(h1, h2, h3) {
  max-inline-size: 100%;
}

button {
  --_bg-light: var(--surface-3);
}
</style>

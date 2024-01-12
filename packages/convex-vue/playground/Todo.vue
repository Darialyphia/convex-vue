<script setup lang="ts">
import { useConvexMutation } from '@/composables/useMutation';
import { api } from '@api';
import { Doc } from '../convex/_generated/dataModel';

const { todo } = defineProps<{ todo: Doc<'todos'> }>();

const { mutate: setCompleted } = useConvexMutation(api.todos.setCompleted);
const { mutate: removeTodo, isLoading: isRemoving } = useConvexMutation(api.todos.remove);
</script>

<template>
  <label>
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="setCompleted({ id: todo._id, completed: !todo.completed })"
    />
    {{ todo.text }}
  </label>
  <button
    title="remove todo"
    :disabled="isRemoving"
    @click="removeTodo({ id: todo._id })"
  >
    X
  </button>
</template>

<style scoped>
label + button {
  --_bg: var(--red-7);
  --_size: var(--font-size-0);
  margin-inline-start: var(--size-3);
}

label:has(input:checked) {
  text-decoration: line-through;
}
</style>

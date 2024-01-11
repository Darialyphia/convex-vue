<script setup lang="ts">
import { definePage } from 'vue-router/auto';
import TodoList from '@/components/TodoList.vue';

definePage({
  name: 'Home'
});
</script>

<template>
  <TodoList />
</template>

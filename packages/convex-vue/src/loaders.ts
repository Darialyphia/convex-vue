import { api } from '@api';
import { defineRouteLoader } from './composables/useRouteLoader';

export const loaders = {
  Home: defineRouteLoader({
    todos: {
      query: api.todos.list,
      args: () => ({})
    }
  })
};

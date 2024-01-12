import { api } from '@api';
import { defineRouteLoader } from '../src/composables/useRouteLoader';

export const loaders = {
  Home: defineRouteLoader({
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
};

export type Loaders = typeof loaders;

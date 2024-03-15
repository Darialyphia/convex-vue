# @convex-vue/core

## Get Started

- Install the package and its peer dependencies

```bash
npm install @convex-vue/core @vueuse/core convex vue-router
```

### Simple example

```js
import { createConvexVue } from "@convex-vue/core";

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL
});

app.use(convexVue);
```

### Example with auth using auth0

```js
import { createConvexVue } from "@convex-vue/core";

// Example with auth using auth0
const auth = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENTID,
  authorizationParams: {
    redirect_uri: window.location.origin
  }
});

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  auth: {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    getToken: async ({ forceRefreshToken }) => {
      try {
        const response = await auth.getAccessTokenSilently({
          detailedResponse: true,
          cacheMode: forceRefreshToken ? 'off' : 'on'
        });
        return response.id_token;
      } catch (error) {
        return null;
      }
    },
    installNavigationGuard: true,
    needsAuth: to => to.meta.needsAuth
    redirectTo: () => ({
      name: 'Login'
    })
  }
});

app.use(convexVue);
```

- You can now use the convex-vue composables and components in your app 😊

## Composables

### useConvexQuery

Subscribes to a convex query. It expose a `suspense` function to enable use inside a `<Suspense />` boundary.

```html
<script setup lang="ts">
  import { api } from '../convex/_generated/api';
  import { useConvexQuery } from "@convex-vue/core";

  const { data, isLoading, error, suspense } = useConvexQuery(
    api.todos.list, // the query name
    { completed: true } // query arguments, if no arguments you need to pass an empty object. It can be ref
  );

  await suspense(); // if used, must be called as a child of <Suspense/> component
</script>
```

### useConvexPaginatedQuery

Subscribes to a convex query and handles pagination. It expose a `suspense` function to enable use inside a `<Suspense />` boundary that will load the first page.

```html
<script setup lang="ts">
  import { api } from '../convex/_generated/api';
  import { useConvexPaginatedQuery } from "@convex-vue/core";

  const {
    data,
    lastPage,
    isLoading,
    isLoadingMore,
    isDone,
    loadMore,
    reset,
    pages,
    error,
    suspense,
  } = useConvexPaginatedQuery(
    api.todos.list, // the query name
    { completed: true } // query arguments, if no arguments you need to pass an empty object. It can be ref,
    { numItems: 50 } // the number of items per page
  );

  await suspense(); // if used, must be called as a child of <Suspense/> component
</script>
```

### useConvexMutation

Handles convex mutations. Optimistic updates are supported.

```js
import { useConvexMutation } from "@convex-vue/core";

const { isLoading, error, mutate: addTodo } = useConvexMutation(api.todos.add, {
  onSuccess() {
    todo.value = '';
  },
  onError(err) {
   console.error(err)
  },
  optimisticUpdate(ctx) {
    const current = ctx.getQuery(api.todos.list, {});
    if (!current) return;

    ctx.setQuery(api.todos.list, {}, [
      {
        _creationTime: Date.now(),
        _id: 'optimistic_id' as Id<'todos'>,
        completed: false,
        text: todo.text
      },
      ...current
    ]);
  }
});
```

### useConvexAction

Handles convex actions.

```js
import { useConvexAction } from "@convex-vue/core";

const { isLoading, error, mutate } = useConvexAction(api.some.action, {
  onSuccess(result) {
    console.log(result);
  },
  onError(err) {
    console.error(err);
  }
});
```

### Components

Convex-vue exposes some helpers components to use queries. This can be useful if you solely need it's data in your component templates

### <ConvexQuery />

```jsx
<ConvexQuery :query="api.todos.list" :args="{}">
  <template #loading>Loading todos...</template>

  <template #error="{ error }">{{ error }}</template>

  <template #empty>No todos yet.</template>

  <template #default="{ data: todos }">
    <ul>
      <li v-for="todo in todos" :key="todo._id">
        <Todo :todo="todo" />
      </li>
    </ul>
  </template>
</ConvexQuery>
```

### <ConvexPaginatedQuery />

```jsx
 <ConvexPaginatedQuery
  :query="api.todos.paginatedList"
  :args="{}"
  :options="{ numItems: 5 }"
>
  <template #loading>Loading todos...</template>

  <template #error="{ error, reset }">
    <p>{{ error }}</p>
   <button @click="reset">Retry</button>
  </template>

  <template #default="{ data: todos, isDone, loadMore, isLoadingMore, reset }">
    <ul>
      <li v-for="todo in todos" :key="todo._id">
        <Todo :todo="todo" />
      </li>
    </ul>
    <Spinner v-if="isLoadingMore" />
    <footer>
      <button :disabled="isDone" @click="loadMore">Load more</button>
      <button @click="reset">Reset</button>
    </footer>
  </template>
</ConvexPaginatedQuery>
```

## 🧪 Route Loaders (experimental)

Taking inspiration from [Remix's route loaders ](https://remix.run/docs/en/main/route/loader), Convex-vue introduces a mechanism to specify which data a route needs. The data will then start fetching when navigating, before loading the javascript for the page and mouting its component. Under the hood, this fires a Convex client subscription so that, hopefully, by the time the page mounts, the convex client cache will already have the data, or , at least, the request wil lalready be in flight.

You need to use vue-router to use this feature.

- First, define a route loader map liek below.

```ts
import { api } from '@api';
import { defineRouteLoader } from '@convex-vue/core';

// defineRouteLoader will provide you with type safety
export const loaders = {
  Home: defineRouteLoader({
    todos: {
      query: api.todos.list,
      args() {
        return {};
      }
    }
  }),

  TodoDetails: defineRouteLoader({
    todo: {
      query: api.todos.byId,
      args(route) {
        return {
          id: route.params.id as Id<'Todos'>
        };
      }
    }
  })
};

export type Loaders = typeof loaders;
```

- Then, pass the rotue loader map to the convex-vue plugin

```ts
import { loaders } from './loaders';

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  routeLoaderMap: loaders
});

app.use(convexVue);
```

- That's it ! Now, when navigating to a page, convex-vue will look in your loader map and search for a loader corresponding to the `name` property of the route. Alternatively, you can provide a `loader` property in your routes `meta`, andit will be used instead.

- You can also use the `useRouteLoader` to get akk the data for one loader in one go, instead of using multiple instances of `useConvexQuery` or `useConvexPaginatedQuery`.

```ts
const { todos } = useRouteLoader<Loaders['Home']>();
```

⚠️ Due to the way vue-router's route matching works, you will get the data for **ALL** the matched routes when using nested routes. Be wary of naming conflicts !

- A `<ConvexLink />` component is also available. It just wraps vue-router's `<RouterLink />` and will prefetch its target loader on hover. The component accepts a `prefetchTimeout` prop to set how long the link should be hovered in order to start prefetching

```js
<ConvexLink :to="{ name: 'Home' }">Todos</ConvexLink>
```

<script setup lang="ts">
import { useUser, SignOutButton } from 'vue-clerk';

const { user } = useUser();
</script>

<template>
  <header>
    <nav>
      <ul>
        <li>
          <ConvexLink to="/">Home</ConvexLink>
        </li>
        <li>
          <ConvexLink to="/todos">Todos</ConvexLink>
        </li>
        <li>
          <NuxtLink to="/todos">Todos (no prefetching)</NuxtLink>
        </li>
      </ul>
    </nav>

    <div v-if="user">
      {{ user.username }}
      <SignOutButton />
    </div>
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

#__nuxt {
  > header {
    display: flex;
    justify-content: space-between;

    ul {
      padding: 0;
      list-style: none;
      display: flex;
      gap: var(--size-3);

      > li {
        padding: 0;

        > a,
        a:hover,
        a:visited {
          color: inherit;
        }
      }
    }
  }
}
</style>

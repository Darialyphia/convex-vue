<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { useConvexAuth } from './composables/useConvexAuth';
import ConvexLink from './components/convex/ConvexLink.vue';

const { loginWithRedirect, logout } = useAuth0();
const { isAuthenticated } = useConvexAuth();

const location = window.location;
</script>

<template>
  <header class="container">
    <h1><ConvexLink :to="{ name: 'Home' }">Convex vue demo</ConvexLink></h1>
    <button v-if="!isAuthenticated" @click="loginWithRedirect()">Log in</button>
    <template v-else>
      <span>
        <RouterLink :to="{ name: 'Protected' }">Protected page</RouterLink>
      </span>
      <button @click="logout({ logoutParams: { returnTo: location.origin } })">
        Log out
      </button>
    </template>
  </header>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Suspense>
        <component :is="Component"></component>

        <template #fallback>
          <main>Loading...</main>
        </template>
      </Suspense>
    </template>
    <template v-else>Authenticating...</template>
  </RouterView>
</template>

<style scoped>
header > * {
  display: inline-block;

  &:not(:first-child) {
    margin-inline-start: var(--size-4);
  }
}

h1 {
  font-size: var(--font-size-4);
}

header a {
  color: inherit;
}
</style>

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
  max-width: var(--size-lg);
  margin-inline: auto;
}

:is(h1, h2, h3) {
  max-inline-size: 100%;
}

button {
  --_bg-light: var(--surface-3);
}
</style>

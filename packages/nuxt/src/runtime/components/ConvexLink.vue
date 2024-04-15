<script setup lang="ts">
import type { NuxtLinkProps } from '#app';
import { useConvex, CONVEX_LOADERS_INJECTION_KEY } from '@convex-vue/core';
import { computed, inject, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

type Props = NuxtLinkProps & {
  prefetch?: boolean;
  prefetchTimeout?: number;
};

const props = withDefaults(defineProps<Props>(), {
  prefetch: true,
  prefetchTimeout: 250
});

const client = useConvex();
const loaderMap = inject(CONVEX_LOADERS_INJECTION_KEY, {});

const { resolve } = useRouter();

let timeout: ReturnType<typeof setTimeout>;

const preload = () => {
  // @ts-expect-error
  const route = resolve(props.to);
  route.matched.forEach(match => {
    const loader =
      match.meta.loader ?? loaderMap[typeof match.name === 'string' ? match.name : ''];
    if (!loader) return;

    Object.values(loader).forEach(({ query, args }) => {
      client.onUpdate(query, args(match), () => {});
    });
  });
};

const onMouseEnter = () => {
  if (props.prefetch === false) return;

  timeout = setTimeout(() => {
    preload();
  }, props.prefetchTimeout);
};

const onMouseLeave = () => {
  if (!props.prefetch) return;
  clearTimeout(timeout);
};

onUnmounted(() => {
  clearTimeout(timeout);
});

const linkProps = computed(() => {
  const { prefetch, prefetchTimeout, ...rest } = props;

  // types from unplugin-vue-router freaking out a bit
  return rest as any;
});
</script>

<template>
  <NuxtLink v-bind="linkProps" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <slot />
  </NuxtLink>
</template>

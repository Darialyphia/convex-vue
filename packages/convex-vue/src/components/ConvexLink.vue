<script setup lang="ts">
import { useConvex } from '@/composables/useConvex';
import { CONVEX_LOADERS_INJECTION_KEY } from '@/plugin';
import { computed, inject, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLinkProps } from 'vue-router';

type Props = RouterLinkProps & {
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

const schedulePreload = () => {
  if (props.prefetch === false) return;

  timeout = setTimeout(() => {
    preload();
  }, props.prefetchTimeout);
};

const cancelPreload = () => {
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
  <router-link
    v-bind="linkProps"
    @mouseenter="schedulePreload"
    @mouseleave="cancelPreload"
    @focus="schedulePreload"
    @blur="cancelPreload"
  >
    <slot />
  </router-link>
</template>

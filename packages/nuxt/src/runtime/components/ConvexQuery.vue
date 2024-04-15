<script setup lang="ts" generic="Query extends FunctionReference<'query'>">
import { computed, toValue } from 'vue';
import { type FunctionArgs, type FunctionReference } from 'convex/server';
import { useConvexQuery, type NuxtUseConvexQueryOptions } from '../composables/useQuery';

const props = defineProps<{
  query: Query;
  args: FunctionArgs<Query>;
  options?: NuxtUseConvexQueryOptions;
  suspense?: boolean;
}>();

const slots = defineSlots<{
  default(props: {
    data: Exclude<
      ReturnType<typeof useConvexQuery<Query>>['data']['value'],
      null | undefined
    >;
  }): any;
  loading(props: {}): any;
  error(props: { error: Error }): any;
  empty(props: {}): any;
}>();

const args = computed(() => toValue(props.args));

const { data, isLoading, error, suspense } = useConvexQuery(
  props.query,
  args,
  props.options
);

const isEmpty = computed(
  () => data.value === null || (Array.isArray(data.value) && !data.value.length)
);

if (props.suspense) await suspense();
</script>

<template>
  <slot v-if="isLoading" name="loading" />
  <slot v-else-if="error" name="error" :error="error" />
  <slot v-else-if="isEmpty" name="empty" />
  <slot v-else-if="data" :data="data" />
</template>

<style scoped lang="postcss"></style>

<script setup lang="ts" generic="T">
import { type Ref, computed, toValue } from 'vue';
import {
  type PaginatedQueryArgs,
  type PaginatedQueryReference,
  type NuxtUseConvexPaginatedQueryOptions,
  useConvexPaginatedQuery
} from '../composables/usePaginatedQuery';

const props = defineProps<{
  query: PaginatedQueryReference<T>;
  args: PaginatedQueryArgs<T, PaginatedQueryReference<T>>;
  options: NuxtUseConvexPaginatedQueryOptions;
  suspense?: boolean;
}>();

type Result = ReturnType<typeof useConvexPaginatedQuery<T>>;
type UnwrapDefined<T extends Ref<any>> = Exclude<T['value'], null | undefined>;

defineSlots<{
  default(props: {
    data: UnwrapDefined<Result['data']>;
    lastPage: UnwrapDefined<Result['lastPage']>;
    pages: UnwrapDefined<Result['pages']>;
    isDone: UnwrapDefined<Result['isDone']>;
    isLoadingMore: boolean;
    reset: Result['reset'];
    loadMore: Result['loadMore'];
  }): any;
  loading(props: {}): any;
  error(props: { error: Error; reset: Result['reset'] }): any;
  empty(props: {}): any;
}>();

const args = computed(() => toValue(props.args));

const {
  data,
  isLoading,
  isLoadingMore,
  isDone,
  loadMore,
  reset,
  pages,
  lastPage,
  error,
  suspense
} = useConvexPaginatedQuery(props.query, args, props.options);

const isEmpty = computed(
  () => data.value === null || (Array.isArray(data.value) && !data.value.length)
);

const slotProps = computed(() => ({
  data: data.value,
  pages: pages.value,
  lastPage: lastPage.value!,
  isLoadingMore: isLoadingMore.value,
  isDone: isDone.value,
  reset,
  loadMore
}));
if (props.suspense) await suspense();
</script>

<template>
  <slot v-if="isLoading" name="loading" />
  <slot v-else-if="error" name="error" :error="error" :reset="reset" />
  <slot v-else-if="isEmpty" name="empty" />
  <slot v-else-if="data" v-bind="slotProps" />
</template>

<style scoped lang="postcss"></style>

<script setup lang="ts" generic="T">
import { Ref, computed, toValue } from "vue";
import {
  PaginatedQueryArgs,
  PaginatedQueryReference,
  UseConvexPaginatedQueryOptions,
  useConvexPaginatedQuery,
} from "@/composables/usePaginatedQuery";

const props = defineProps<{
  query: PaginatedQueryReference<T>;
  args: PaginatedQueryArgs<T, PaginatedQueryReference<T>>;
  options: UseConvexPaginatedQueryOptions;
  suspense?: boolean;
}>();

type Result = ReturnType<typeof useConvexPaginatedQuery<T>>;
type UnwrapDefined<T extends Ref<any>> = Exclude<T["value"], null | undefined>;

const slots = defineSlots<{
  default(props: {
    data: UnwrapDefined<Result["data"]>;
    lastPage: UnwrapDefined<Result["lastPage"]>;
    pages: UnwrapDefined<Result["pages"]>;
    isDone: UnwrapDefined<Result["isDone"]>;
    isLoadingMore: boolean;
    reset: Result["reset"];
    loadMore: Result["loadMore"];
  }): any;
  loading(props: {}): any;
  error(props: { error: Error; reset: Result["reset"] }): any;
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
  suspense,
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
  loadMore,
}));
if (props.suspense) await suspense();
</script>

<template>
  <slot name="loading" v-if="isLoading"></slot>
  <slot name="error" v-else-if="error" :error="error" :reset="reset"></slot>
  <slot name="empty" v-else-if="isEmpty"></slot>
  <slot v-else-if="data" v-bind="slotProps"></slot>
</template>

<style scoped lang="postcss"></style>

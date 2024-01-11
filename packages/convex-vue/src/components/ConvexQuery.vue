<script setup lang="ts" generic="Query extends QueryReference">
import { computed, toValue } from "vue";
import { FunctionArgs } from "convex/server";
import {
  QueryReference,
  UseConvexQueryOptions,
  useConvexQuery,
} from "../composables/useQuery";

const props = defineProps<{
  query: Query;
  args: FunctionArgs<Query>;
  options?: UseConvexQueryOptions;
  suspense?: boolean;
}>();

const slots = defineSlots<{
  default(props: {
    data: Exclude<
      ReturnType<typeof useConvexQuery<Query>>["data"]["value"],
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
  <slot name="loading" v-if="isLoading"></slot>
  <slot name="error" v-else-if="error" :error="error"></slot>
  <slot name="empty" v-else-if="isEmpty"></slot>
  <slot v-else-if="data" :data="data"></slot>
</template>

<style scoped lang="postcss"></style>

import {
  FunctionReference,
  PaginationOptions,
  PaginationResult,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";
import { MaybeRefOrGetter, ref, computed, unref, toValue, watch } from "vue";
import { Prettify, DistributiveOmit, Nullable } from "../types";
import { UseConvexQueryOptions } from "./useQuery";
import { useConvex } from "./useConvex";

export type PaginatedQueryReference = FunctionReference<
  "query",
  "public",
  { paginationOpts: PaginationOptions },
  PaginationResult<any>
>;

export type PaginatedQueryArgs<Query extends PaginatedQueryReference> =
  Prettify<DistributiveOmit<FunctionArgs<Query>, "paginationOpts">>;

export const useConvexPaginatedQuery = <Query extends PaginatedQueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions = { enabled: true }
) => {
  const client = useConvex();

  const allPages = ref<FunctionReturnType<Query>[]>([]);
  const lastPage = ref<any>();
  const error = ref<Nullable<Error>>();

  let unsub: () => void;
  const isEnabled = computed(() => unref(options.enabled) ?? true);

  const bind = () => {
    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(query, toValue(args), (newPage) => {
        allPages.value.push(newPage);
        lastPage.value = newPage;
        error.value = undefined;
      });
    }
  };

  watch(isEnabled, bind, { immediate: true });

  return {
    allPages,
    lastPage,
    error,
    isLoading: computed(() => lastPage.value === undefined),
  };
};

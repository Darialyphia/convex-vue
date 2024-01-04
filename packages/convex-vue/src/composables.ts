import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import { CONVEX_INJECTION_KEY } from "./plugin";
import { useSafeInject } from "./utils";
import {
  MaybeRef,
  MaybeRefOrGetter,
  computed,
  ref,
  toValue,
  unref,
  watch,
} from "vue";
import { DistributiveOmit, Nullable, Prettify } from "./types";

export const useConvex = () => {
  return useSafeInject(CONVEX_INJECTION_KEY);
};

type UseConvexQueryOptions = {
  enabled?: MaybeRef<boolean>;
};

type QueryReference = FunctionReference<"query">;
export const useConvexQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions = { enabled: true }
) => {
  const client = useConvex();

  const data = ref<FunctionReturnType<Query>>();
  const error = ref<Nullable<Error>>();

  let unsub: () => void;
  const isEnabled = computed(() => unref(options.enabled) ?? true);

  const bind = () => {
    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(query, toValue(args), (newData) => {
        data.value = newData;
        error.value = undefined;
      });
    }
  };

  watch(isEnabled, bind, { immediate: true });

  return { data, error, isLoading: computed(() => data.value === undefined) };
};

type UseConvexPaginatedQueryOptions = {
  enabled?: MaybeRef<boolean>;
  numItems: number;
};

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
        // @ts-expect-error todo
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

export type MutationReference = FunctionReference<"mutation">;
export function useConvexMutation<Mutation extends MutationReference>(
  mutation: Mutation,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: FunctionReturnType<Mutation>) => void;
    onError?: (err: Error) => void;
  } = {}
) {
  const convex = useConvex();

  const isLoading = ref(false);
  const error = ref<Nullable<Error>>();

  return {
    isLoading,
    error,
    mutate: async (args: Mutation["_args"]) => {
      try {
        isLoading.value = true;
        const result = await convex.mutation(mutation, args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    },
  };
}

export type ActionReference = FunctionReference<"action">;
export function useConvexAction<Action extends ActionReference>(
  action: Action,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: FunctionReturnType<Action>) => void;
    onError?: (err: Error) => void;
  } = {}
) {
  const convex = useConvex();

  const isLoading = ref(false);
  const error = ref<Nullable<Error>>();

  return {
    isLoading,
    error,
    mutate: async (args: Action["_args"]) => {
      try {
        isLoading.value = true;
        const result = await convex.action(action, args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    },
  };
}

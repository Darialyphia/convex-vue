import { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';
import { ref } from 'vue';
import { Nullable } from '@/types';
import { useConvex } from './useConvex';
import { OptimisticUpdate } from 'convex/browser';

export type MutationReference = FunctionReference<'mutation'>;
export function useConvexMutation<Mutation extends MutationReference>(
  mutation: Mutation,
  {
    onSuccess,
    onError,
    optimisticUpdate
  }: {
    onSuccess?: (data: FunctionReturnType<Mutation>) => void;
    onError?: (err: Error) => void;
    optimisticUpdate?: OptimisticUpdate<FunctionArgs<Mutation>>;
  } = {}
) {
  const convex = useConvex();

  const isLoading = ref(false);
  const error = ref<Nullable<Error>>();

  return {
    isLoading,
    error,
    mutate: async (args: FunctionArgs<Mutation>) => {
      try {
        isLoading.value = true;
        const result = await convex.mutation(mutation, args, optimisticUpdate);
        onSuccess?.(result);
        return result;
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    }
  };
}

import { FunctionReference, FunctionReturnType } from "convex/server";
import { ref } from "vue";
import { Nullable } from "@/types";
import { useConvex } from "./useConvex";

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

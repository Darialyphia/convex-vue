import { ConvexClient, OptimisticUpdate } from 'convex/browser';
import {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
  getFunctionName
} from 'convex/server';

export class ConvexVueClient extends ConvexClient {
  async mutation<
    Mutation extends FunctionReference<'mutation'>,
    Args extends FunctionArgs<Mutation>
  >(
    mutation: Mutation,
    args: Args,
    optimisticUpdate?: OptimisticUpdate<Args>
  ): Promise<Awaited<FunctionReturnType<Mutation>>> {
    if (this.disabled) throw new Error('ConvexClient is disabled');

    return await this.client.mutation(getFunctionName(mutation), args, {
      optimisticUpdate
    });
  }
}

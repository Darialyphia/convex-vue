import { RouteLocationNormalized, useRoute } from 'vue-router';
import { FunctionArgs } from 'convex/server';
import { isObject } from '@/utils';
import { inject } from 'vue';
import { QueryReference, useConvexQuery } from './useQuery';
import { CONVEX_LOADERS_INJECTION_KEY } from '@/plugin';
import { api } from '@api';
import { useConvexPaginatedQuery, PaginatedQueryReference } from './usePaginatedQuery';

type RouteLoaderArgsGetter<Query extends QueryReference> = (
  route: RouteLocationNormalized
) => FunctionArgs<Query>;

type RouterDefinition<Query extends QueryReference> = {
  query: Query;
  args: RouteLoaderArgsGetter<Query>;
};

export type AnyRouteLoader = Record<string, RouterDefinition<QueryReference>>;

export type TypedRouteLoader<T extends AnyRouteLoader> = {
  [Key in keyof T]: T[Key] extends RouterDefinition<infer Query>
    ? RouterDefinition<Query>
    : never;
};

export type Infer<T extends TypedRouteLoader<AnyRouteLoader>> = {
  [Key in keyof T]: ReturnType<T[Key]['args']> extends never
    ? 'Your loader args function returns incorrect arguments'
    : T[Key]['query'] extends PaginatedQueryReference<infer ResultType>
      ? ReturnType<typeof useConvexPaginatedQuery<ResultType>>
      : ReturnType<typeof useConvexQuery<T[Key]['query']>>;
};

export const defineRouteLoader = <T extends AnyRouteLoader>(
  loader: T
): TypedRouteLoader<T> => {
  return loader as any;
};

export const loaders = {
  Home: defineRouteLoader({
    todos: {
      query: api.todos.list,
      args: () => ({})
    }
  })
};

export const useRouteLoader = <
  T extends TypedRouteLoader<AnyRouteLoader>
>(): Infer<T> => {
  const route = useRoute();
  const loaderMap = inject(CONVEX_LOADERS_INJECTION_KEY, {});

  const loader = route.meta.loader ?? loaderMap[route.name];
  if (!loader) {
    throw new Error(`Convex route loader not found on route meta for ${route.fullPath}.`);
  }

  if (!isObject(loader)) {
    throw new Error(
      `Convex route loader needs to be an object, received ${typeof loader} instead.`
    );
  }

  return Object.fromEntries(
    Object.entries(loader).map(([key, value]) => {
      const unwrappedArgs = value.args(route);
      return [
        key,
        unwrappedArgs.paginationOpts
          ? useConvexPaginatedQuery(value.query, unwrappedArgs, {
              numItems: unwrappedArgs.paginationOpts.numItems
            })
          : useConvexQuery(value.query, unwrappedArgs)
      ];
    })
  ) as Infer<T>;
};

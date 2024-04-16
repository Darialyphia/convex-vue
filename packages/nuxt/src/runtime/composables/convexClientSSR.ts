import {
  type FunctionReference,
  type FunctionReturnType,
  type OptionalRestArgs,
  getFunctionName
} from 'convex/server';
import { type ConvexClientOptions, ConvexHttpClient } from 'convex/browser';
import { ConvexVueClient } from '@convex-vue/core';
import { isString } from '../utils';

type AuthTokenFetcher = (args: {
  forceRefreshToken: boolean;
}) => Promise<string | null | undefined>;

type QueryReference = FunctionReference<'query'>;

export class ConvexVueClientWithSSR extends ConvexVueClient {
  private httpClient: ConvexHttpClient;
  private authTokenFetcher?: AuthTokenFetcher;
  private ssrAuthToken?: string | null;
  private ssrOnTokenChange?: (isAuthenticated: boolean) => void;
  private ssrQueriesCache = new Map<string, Map<string, any>>(); // oh god

  private ssrAuthTokenPromise: Promise<string | null | undefined> | null = null;

  constructor(address: string, options: ConvexClientOptions = {}) {
    super(address, options);
    this.httpClient = new ConvexHttpClient(address);
  }

  setAuth(fetchToken: AuthTokenFetcher, onChange?: (isAuthenticated: boolean) => void) {
    super.setAuth(fetchToken, onChange);
    this.authTokenFetcher = fetchToken;
    this.ssrOnTokenChange = onChange;
  }

  private fetchAuthTokenSSR() {
    if (!this.ssrAuthTokenPromise) {
      this.ssrAuthTokenPromise = this.authTokenFetcher!({
        forceRefreshToken: true
      });
    }

    return this.ssrAuthTokenPromise;
  }

  private getQueriesCache(query: QueryReference) {
    const queryName = getFunctionName(query);
    if (!this.ssrQueriesCache.has(queryName)) {
      this.ssrQueriesCache.set(queryName, new Map());
    }

    return this.ssrQueriesCache.get(queryName)!;
  }

  private async fetchTokenSSR() {
    this.ssrAuthToken = await this.fetchAuthTokenSSR();
    this.ssrOnTokenChange?.(isString(this.ssrAuthToken));
    if (isString(this.ssrAuthToken)) {
      this.httpClient.setAuth(this.ssrAuthToken);
    }
  }

  private async getSSRPromise<Query extends QueryReference>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ) {
    // if no third party auth provider is used, we dont need to bother wit hauth
    const needToFetchToken = this.authTokenFetcher && this.ssrAuthToken === undefined;

    if (needToFetchToken) {
      await this.fetchTokenSSR();
    }

    return this.httpClient.query(query, ...args);
  }

  async querySSR<Query extends QueryReference>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    const cache = this.getQueriesCache(query);
    const cacheKey = JSON.stringify(args);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, this.getSSRPromise(query, ...args));
    }

    return cache.get(cacheKey) as Promise<FunctionReturnType<Query>>;
  }
}

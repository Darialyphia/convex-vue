import { FunctionPlugin, InjectionKey } from "vue";
import { ConvexClient, type ConvexClientOptions } from "convex/browser";

export type ConvexVuePluginOptions = {
  convexUrl: string;
  convexOptions?: ConvexClientOptions;
};

export const CONVEX_INJECTION_KEY = Symbol(
  "convexClient"
) as InjectionKey<ConvexClient>;

export const convexVuePlugin: FunctionPlugin<ConvexVuePluginOptions> = (
  app,
  { convexOptions, convexUrl }
) => {
  const client = new ConvexClient(convexUrl, convexOptions);
  app.provide(CONVEX_INJECTION_KEY, client);
};

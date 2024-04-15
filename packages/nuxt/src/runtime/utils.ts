export const isString = (x: unknown): x is string => typeof x === 'string';

export type Nullable<T> = T | null | undefined;
export type Defined<T> = Exclude<T, undefined | null>;
export const isDefined = <T>(arg: Nullable<T>): arg is Defined<T> =>
  arg !== undefined && arg !== null;

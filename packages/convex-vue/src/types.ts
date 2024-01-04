export type Nullable<T> = T | null | undefined;
export type Defined<T> = Exclude<T, undefined | null>;
export type DistributiveOmit<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property];
};
export type Prettify<ObjectType extends Record<any, any>> =
  ObjectType extends Record<any, any>
    ? {
        [Key in keyof ObjectType]: ObjectType[Key];
      }
    : never;

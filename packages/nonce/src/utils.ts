export type Deferrable<T> = {
  [K in keyof T]: T[K] | Promise<T[K]>;
};

export function getDeferrable<T>(object: Deferrable<T>): T {
  const result: any = {};
  for (const key in object) {
    result[key] = object[key] instanceof Promise ? object[key] : object[key];
  }
  return result;
}

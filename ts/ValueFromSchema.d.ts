import type { Field } from "./field.d.ts";

export type ValueFromSchema<Schema extends Record<string, Field<unknown>>> = {
	[K in keyof Schema]: Schema[K] extends Field<infer V> ? V : never;
};

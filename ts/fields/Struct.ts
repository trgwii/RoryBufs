import type { Field } from "../field.d.ts";
import type { ValueFromSchema } from "../ValueFromSchema.d.ts";

export class Struct<Schema extends Record<string, Field<unknown>>>
	implements Field<ValueFromSchema<Schema>> {
	readonly size: number | "variadic";
	constructor(readonly schema: Schema) {
		const sizes = Object.values(this.schema).map((x) => x.size);

		this.size = sizes.some((x) => x === "variadic") ? "variadic" : (4 +
			sizes.reduce<number>((acc, size) => acc + (size as number), 0));
	}

	encode(
		data: ValueFromSchema<Schema>,
		dv: DataView,
		offset = 0,
	) {
		const initialOffset = offset;
		for (const key in this.schema) {
			const value = data[key] as unknown;
			offset += this.schema[key].encode(value, dv, offset);
		}
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const initialOffset = offset;
		const data: Record<string, unknown> = {};
		for (const key in this.schema) {
			const field = this.schema[key];
			const { bytesRead, value } = field.decode(buf, offset);
			data[key] = value;
			offset += bytesRead;
		}
		return {
			bytesRead: offset - initialOffset,
			value: data as ValueFromSchema<Schema>,
		};
	}
}

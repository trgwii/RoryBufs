import type { Field } from "../field.d.ts";
import { assert } from "../utils.ts";

export class FixedArray<Length extends number, T>
	implements Field<T[] & { length: Length }> {
	readonly size: number;
	constructor(readonly length: Length, readonly field: Field<T>) {
		this.size = length * field.size;
	}

	encode(items: T[], buf: DataView, offset = 0) {
		assert(this.length === items.length, "Wrong array size");
		for (const value of items) {
			offset += this.field.encode(value, buf, offset);
		}
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		const items: T[] = [];
		for (let i = 0; i < this.length; i++) {
			items.push(this.field.decode(buf, offset));
			offset += this.field.size;
		}
		return items as T[] & { length: Length };
	}
}

import { crc16 } from "./crc16.ts";
import { Field } from "./field.d.ts";

import { assert } from "./utils.ts";

import type { ValueFromSchema } from "./ValueFromSchema.d.ts";

export class Buf<
	Schema extends Record<string, Field<unknown>>,
> {
	readonly version = 0;
	readonly checksum: number;
	readonly size: number | "variadic";
	constructor(readonly schema: Schema) {
		this.checksum = crc16(
			new TextEncoder().encode(Object.keys(schema).join(":")),
		);
		const sizes = Object.values(this.schema).map((x) => x.size);

		this.size = sizes.some((x) => x === "variadic") ? "variadic" : (4 +
			sizes.reduce<number>((acc, size) => acc + (size as number), 0));
	}
	encode(
		data: ValueFromSchema<Schema>,
		bufOrMax?: number | Uint8Array,
	) {
		let offset = 0;
		if (!bufOrMax && this.size === "variadic") {
			throw new Error("bufOrMax is required for variadic sizes");
		}
		const size = typeof bufOrMax === "number" ? bufOrMax : this.size as number;
		const buf = bufOrMax instanceof Uint8Array
			? bufOrMax
			: new Uint8Array(size);
		const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
		dv.setUint16(offset, this.version);
		offset += 2;
		dv.setUint16(offset, this.checksum);
		offset += 2;
		for (const key in this.schema) {
			const value = data[key] as unknown;
			offset += this.schema[key].encode(value, dv, offset);
		}
		return buf.subarray(0, offset);
	}
	decode(buf: Uint8Array): ValueFromSchema<Schema> {
		let offset = 0;
		const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
		assert(this.version === dv.getUint16(offset), "Invalid buffer version");
		offset += 2;
		assert(this.checksum === dv.getUint16(offset), "Invalid checksum");
		offset += 2;
		const data: Record<string, unknown> = {};
		for (const key in this.schema) {
			const field = this.schema[key];
			const { bytesRead, value } = field.decode(dv, offset);
			data[key] = value;
			offset += bytesRead;
		}
		return data as ValueFromSchema<Schema>;
	}
}

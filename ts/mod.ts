import { crc16 } from "./crc16.ts";
import { Field } from "./field.d.ts";

import { assert } from "./utils.ts";

export type ValueFromSchema<Schema extends Record<string, Field<unknown>>> = {
	[K in keyof Schema]: Schema[K] extends Field<infer V> ? V : never;
};

export class Buf<Schema extends Record<string, Field<unknown>>> {
	readonly version = 0;
	readonly checksum: number;
	readonly size: number;
	constructor(readonly schema: Schema) {
		this.checksum = crc16(
			new TextEncoder().encode(Object.keys(schema).join(":")),
		);
		this.size = 4 +
			Object.values(this.schema).reduce((acc, f) => acc + f.size, 0);
	}
	encode(
		data: ValueFromSchema<Schema>,
		buf?: Uint8Array,
	) {
		let offset = 0;
		buf = buf ?? new Uint8Array(this.size);
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
			data[key] = field.decode(dv, offset);
			offset += field.size;
		}
		return data as ValueFromSchema<Schema>;
	}
}

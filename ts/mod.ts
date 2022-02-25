import { crc16 } from "./crc16.ts";
import type { Field, Reader, Writer } from "./field.d.ts";

import { assert } from "./utils.ts";

import type { ValueFromSchema } from "./ValueFromSchema.d.ts";
import { Struct } from "./fields/Struct.ts";

export class Buf<
	Schema extends Record<string, Field<unknown>>,
> {
	readonly version = 0;
	readonly checksum: number;
	readonly size: number | "variadic";
	readonly struct: Struct<Schema>;
	constructor(readonly schema: Schema) {
		this.struct = new Struct(schema);
		this.checksum = crc16(
			new TextEncoder().encode(Object.keys(schema).join(":")),
		);
		this.size = this.struct.size;
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
		offset += this.struct.encode(data, dv, offset);
		return buf.subarray(0, offset);
	}
	decode(buf: Uint8Array): ValueFromSchema<Schema> {
		let offset = 0;
		const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
		assert(this.version === dv.getUint16(offset), "Invalid buffer version");
		offset += 2;
		assert(this.checksum === dv.getUint16(offset), "Invalid checksum");
		offset += 2;
		return this.struct.decode(dv, offset).value;
	}
	write(data: ValueFromSchema<Schema>, stream: Writer) {
		return this.struct.write(data, stream);
	}
	read(stream: Reader) {
		return this.struct.read(stream);
	}
}

import { crc16 } from "./crc16.ts";
import type { Field, Reader, Writer } from "./field.ts";
import { assert, type ValueFromSchema } from "./utils.ts";
import { Struct } from "./fields/Struct.ts";
import { U16 } from "./fields/U16.ts";

export class Buf<
	Schema extends Record<string, Field<unknown>>,
> {
	readonly version = 0;
	readonly versionField = new U16();
	readonly checksum: number;
	readonly checksumField = new U16();
	readonly size: number | "variadic";
	readonly struct: Struct<Schema>;
	constructor(schema: Schema) {
		this.struct = new Struct(schema);
		this.checksum = crc16(
			new TextEncoder().encode(Object.keys(schema).join(":")),
		);
		this.size = typeof this.struct.size === "number"
			? this.struct.size + 4
			: this.struct.size;
	}
	requiredSize(data: ValueFromSchema<Schema>): number {
		if (this.size !== "variadic") return this.size;
		return this.struct.requiredSize(data) + 4;
	}
	validate(data: ValueFromSchema<Schema>) {
		this.struct.validate(data);
	}
	encode(
		data: ValueFromSchema<Schema>,
		bufOrMax?: number | Uint8Array,
	) {
		this.struct.validate(data);
		const size = typeof bufOrMax === "number"
			? bufOrMax
			: this.size === "variadic"
			? this.requiredSize(data)
			: this.size;
		const buf = bufOrMax instanceof Uint8Array
			? bufOrMax
			: new Uint8Array(size);
		const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
		let offset = 0;
		offset += this.versionField.encode(this.version, dv, offset);
		offset += this.checksumField.encode(this.checksum, dv, offset);
		offset += this.struct.encode(data, dv, offset);
		return buf.subarray(0, offset);
	}
	decode(buf: Uint8Array): ValueFromSchema<Schema> {
		const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
		let offset = 0;
		const v = this.versionField.decode(dv, offset);
		offset += v.bytesRead;
		assert(this.version === v.value, "Invalid buffer version");
		const c = this.checksumField.decode(dv, offset);
		offset += c.bytesRead;
		assert(this.checksum === c.value, "Invalid checksum");
		return this.struct.decode(dv, offset).value;
	}
	async write(data: ValueFromSchema<Schema>, stream: Writer) {
		this.struct.validate(data);
		await this.versionField.write(this.version, stream);
		await this.checksumField.write(this.checksum, stream);
		return this.struct.write(data, stream);
	}
	async read(stream: Reader) {
		const version = await this.versionField.read(stream);
		assert(this.version === version.value, "Invalid buffer version");
		const checksum = await this.checksumField.read(stream);
		assert(this.checksum === checksum.value, "Invalid checksum");
		return this.struct.read(stream);
	}
}

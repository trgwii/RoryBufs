import type { Field, Reader, Writer } from "../field.d.ts";
import { assert, readAll, writeAll } from "../utils.ts";

export class FixedText implements Field<string> {
	constructor(readonly size: number) {}
	validate(value: string) {
		assert(
			value.length <= this.size,
			`string is too long (got: ${value.length}, max: ${this.size})`,
		);
	}
	encode(value: string, buf: DataView, offset = 0) {
		this.validate(value);
		const dest = new Uint8Array(buf.buffer, buf.byteOffset + offset, this.size);
		const { written } = new TextEncoder().encodeInto(value, dest);
		// Non-null assertions needed for npm build
		if (written! < this.size) dest[written!] = 0;
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		const arr = new Uint8Array(
			buf.buffer,
			buf.byteOffset + offset,
			this.size,
		);
		const zeroIndex = arr.indexOf(0);
		const end = zeroIndex === -1 ? this.size : zeroIndex;
		return {
			bytesRead: this.size,
			value: new TextDecoder().decode(arr.subarray(0, end)),
		};
	}
	write(value: string, stream: Writer) {
		const buf = new ArrayBuffer(this.size);
		const dv = new DataView(buf);
		this.encode(value, dv);
		return writeAll(stream, new Uint8Array(buf));
	}
	async read(stream: Reader) {
		const buf = new ArrayBuffer(this.size);
		await readAll(stream, new Uint8Array(buf));
		const dv = new DataView(buf);
		return this.decode(dv);
	}
}

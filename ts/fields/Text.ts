import type { Field } from "../field.d.ts";
import { assert } from "../utils.ts";

export class Text implements Field<string> {
	constructor(readonly size: number) {}
	encode(value: string, buf: DataView, offset = 0) {
		assert(value.length <= this.size, value + " is too long");
		const dest = new Uint8Array(buf.buffer, buf.byteOffset + offset, this.size);
		const { written } = new TextEncoder().encodeInto(value, dest);
		if (written < this.size) dest[written] = 0;
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
		return new TextDecoder().decode(arr.subarray(0, end));
	}
}

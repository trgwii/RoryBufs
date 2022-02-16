import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class U16 implements Field<number> {
	readonly size = 2;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, 0, 0xFFFF);
		buf.setUint16(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getUint16(offset) };
	}
}

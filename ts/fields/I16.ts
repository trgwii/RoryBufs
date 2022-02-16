import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class I16 implements Field<number> {
	readonly size = 2;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, -0x10000 / 2, 0x10000 / 2 - 1);
		buf.setInt16(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getInt16(offset) };
	}
}

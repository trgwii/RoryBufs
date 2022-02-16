import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class I8 implements Field<number> {
	readonly size = 1;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, -0x100 / 2, 0x100 / 2 - 1);
		buf.setInt8(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return buf.getInt8(offset);
	}
}

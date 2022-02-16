import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class I32 implements Field<number> {
	readonly size = 4;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, -0x100000000 / 2, 0x100000000 / 2 - 1);
		buf.setInt32(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return buf.getInt32(offset);
	}
}

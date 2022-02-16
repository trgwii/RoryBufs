import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class U8 implements Field<number> {
	readonly size = 1;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, 0, 0xFF);
		buf.setUint8(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return buf.getUint8(offset);
	}
}

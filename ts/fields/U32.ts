import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class U32 implements Field<number> {
	readonly size = 4;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, 0, 0xFFFFFFFF);
		buf.setUint32(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getUint32(offset) };
	}
}

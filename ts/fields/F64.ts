import type { Field } from "../field.d.ts";

export class F64 implements Field<number> {
	readonly size = 8;
	encode(value: number, buf: DataView, offset = 0) {
		buf.setFloat64(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getFloat64(offset) };
	}
}

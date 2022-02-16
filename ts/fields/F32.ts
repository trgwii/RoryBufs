import type { Field } from "../field.d.ts";

export class F32 implements Field<number> {
	readonly size = 4;
	encode(value: number, buf: DataView, offset = 0) {
		buf.setFloat32(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getFloat32(offset) };
	}
}

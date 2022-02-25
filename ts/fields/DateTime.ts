import type { Field } from "../field.d.ts";

export class DateTime implements Field<Date> {
	readonly size = 8;
	encode(value: Date, buf: DataView, offset = 0) {
		buf.setFloat64(offset, value.getTime());
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: new Date(buf.getFloat64(offset)) };
	}
}

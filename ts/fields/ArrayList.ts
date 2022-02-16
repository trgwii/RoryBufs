import type { Field } from "../field.d.ts";

export class ArrayList<T> implements Field<T[]> {
	readonly size = "variadic";
	constructor(
		readonly field: Field<T>,
	) {}

	encode(items: T[], buf: DataView, offset = 0) {
		const initialOffset = offset;
		buf.setUint32(offset, items.length);
		offset += 4;
		for (const value of items) {
			offset += this.field.encode(value, buf, offset);
		}
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const initialOffset = offset;
		const items: T[] = [];
		const length = buf.getUint32(offset);
		offset += 4;
		for (let i = 0; i < length; i++) {
			const { bytesRead, value } = this.field.decode(buf, offset);
			items.push(value);
			offset += bytesRead;
		}
		return { bytesRead: offset - initialOffset, value: items as T[] };
	}
}

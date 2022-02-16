import type { Field } from "../field.d.ts";
export class Union<A, B> implements Field<A | B> {
	readonly size = "variadic";
	constructor(
		readonly left: Field<A>,
		readonly right: Field<B>,
		readonly isRight: (value: A | B) => value is B,
	) {}

	encode(value: A | B, buf: DataView, offset = 0) {
		const isRight = this.isRight(value);
		const initialOffset = offset;
		buf.setUint8(offset, Number(isRight));
		offset += 1;
		if (isRight) {
			offset += this.right.encode(value, buf, offset);
		} else {
			offset += this.left.encode(value, buf, offset);
		}
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const isRight = Boolean(buf.getUint8(offset));
		offset += 1;
		if (isRight) {
			const { bytesRead, value } = this.right.decode(buf, offset);
			return { bytesRead: bytesRead + 1, value };
		}
		const { bytesRead, value } = this.left.decode(buf, offset);
		return { bytesRead: bytesRead + 1, value };
	}
}
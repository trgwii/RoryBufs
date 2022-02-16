import type { Field } from "../field.d.ts";
import { assert } from "../utils.ts";

export class Union<A, B> implements Field<A | B> {
	readonly size: number;
	constructor(
		readonly left: Field<A>,
		readonly right: Field<B>,
		readonly isRight: (value: A | B) => value is B,
	) {
		this.size = 1 + Math.max(left.size, right.size);
	}

	encode(value: A | B, buf: DataView, offset = 0) {
		const isRight = this.isRight(value);
		buf.setUint8(offset, Number(isRight));
		offset += 1;
		if (isRight) {
			this.right.encode(value, buf, offset);
			return this.size;
		}
		this.left.encode(value, buf, offset);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		const isRight = Boolean(buf.getUint8(offset));
		offset += 1;
		if (isRight) {
			return this.right.decode(buf, offset);
		}
		return this.left.decode(buf, offset);
	}
}

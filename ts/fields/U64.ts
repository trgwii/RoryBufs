import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class U64 implements Field<bigint> {
	readonly size = 8;
	encode(value: bigint, buf: DataView, offset = 0) {
		assertWithin(value, 0n, 0xFFFFFFFFFFFFFFFFn);
		buf.setBigUint64(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return buf.getBigUint64(offset);
	}
}

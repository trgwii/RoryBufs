import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

export class I64 implements Field<bigint> {
	readonly size = 8;
	encode(value: bigint, buf: DataView, offset = 0) {
		assertWithin(
			value,
			-0x10000000000000000n / 2n,
			0x10000000000000000n / 2n - 1n,
		);
		buf.setBigInt64(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getBigInt64(offset) };
	}
}

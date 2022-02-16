import type { Field } from "../field.d.ts";
import { assert } from "../utils.ts";

export class Null implements Field<null> {
	readonly size = 0;
	encode(value: null) {
		assert(value == null, "Non-null value passed to null");
		return this.size;
	}
	decode() {
		return { bytesRead: 0, value: null };
	}
}

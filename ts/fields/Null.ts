import type { Field } from "../field.d.ts";
import { assert } from "../utils.ts";

export class Null implements Field<null> {
	readonly size = 0;
	validate(value: null) {
		assert(value == null, "Non-null value passed to null");
	}
	encode(value: null) {
		return this.size;
	}
	decode() {
		return { bytesRead: 0, value: null };
	}
	write(value: null) {
		return Promise.resolve(this.encode(value));
	}
	read() {
		return Promise.resolve(this.decode());
	}
}

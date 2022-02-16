import type { Field } from "../field.d.ts";
import { Null } from "./Null.ts";
import { Union } from "./Union.ts";

export class Optional<T> implements Field<T | null> {
	readonly size = 0;
	readonly field: Field<T | null>;
	constructor(field: Field<T>) {
		this.field = new Union(
			[new Null(), field],
			(val) => val == null ? 0 : 1,
		);
	}
	encode(value: T | null, buf: DataView, offset?: number) {
		return this.field.encode(value, buf, offset);
	}
	decode(buf: DataView, offset?: number) {
		return this.field.decode(buf, offset);
	}
}

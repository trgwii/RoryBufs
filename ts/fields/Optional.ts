import type { Field, Reader, Writer } from "../field.d.ts";
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
	validate(value: T | null) {
		this.field.validate(value);
	}
	encode(value: T | null, buf: DataView, offset?: number) {
		return this.field.encode(value, buf, offset);
	}
	decode(buf: DataView, offset?: number) {
		return this.field.decode(buf, offset);
	}
	write(value: T | null, stream: Writer) {
		return this.field.write(value, stream);
	}
	read(stream: Reader) {
		return this.field.read(stream);
	}
}

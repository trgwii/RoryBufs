import type { Field, Reader, Writer } from "../field.ts";
import { ArrayList } from "./ArrayList.ts";
import { U8 } from "./U8.ts";

export class Text<Len extends Field<number | bigint>> implements Field<string> {
	readonly size = "variadic";
	readonly field: ArrayList<U8, Len>;
	constructor(length?: Len) {
		this.field = new ArrayList(new U8(), length);
	}
	validate(value: string) {
		this.field.length.validate(value.length);
		this.field.validate([...new TextEncoder().encode(value)]);
	}
	requiredSize(value: string): number {
		return this.field.requiredSize([...new TextEncoder().encode(value)]);
	}
	encode(value: string, buf: DataView, offset = 0) {
		return this.field.encode([...new TextEncoder().encode(value)], buf, offset);
	}
	decode(buf: DataView, offset = 0) {
		const { bytesRead, value } = this.field.decode(buf, offset);
		return {
			bytesRead,
			value: new TextDecoder().decode(new Uint8Array(value)),
		};
	}
	write(value: string, stream: Writer) {
		return this.field.write([...new TextEncoder().encode(value)], stream);
	}
	async read(stream: Reader) {
		const result = await this.field.read(stream);
		return {
			bytesRead: result.bytesRead,
			value: new TextDecoder().decode(new Uint8Array(result.value)),
		};
	}
}

import type { Field, Reader, Writer } from "../field.d.ts";
import { ArrayList } from "./ArrayList.ts";
import { U8 } from "./U8.ts";

export class Text implements Field<string> {
	readonly size = "variadic";
	readonly field = new ArrayList(new U8());
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
		const value = await this.field.read(stream);
		return new TextDecoder().decode(new Uint8Array(value));
	}
}

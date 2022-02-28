import type { Field, Reader, Writer } from "../field.d.ts";
import { assert, readAll, writeAll } from "../utils.ts";

export class FixedArray<Length extends number, T>
	implements Field<T[] & { length: Length }> {
	readonly size: number;
	constructor(
		readonly length: Length,
		readonly field: Field<T> & { size: number },
	) {
		this.size = length * field.size;
	}

	encode(items: T[], buf: DataView, offset = 0) {
		assert(this.length === items.length, "Wrong array size");
		for (const value of items) {
			offset += this.field.encode(value, buf, offset);
		}
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		const items: T[] = [];
		for (let i = 0; i < this.length; i++) {
			const { bytesRead, value } = this.field.decode(buf, offset);
			items.push(value);
			offset += bytesRead;
		}
		return { bytesRead: this.size, value: items as T[] & { length: Length } };
	}
	write(items: T[], stream: Writer) {
		const buf = new ArrayBuffer(this.size);
		const dv = new DataView(buf);
		this.encode(items, dv);
		return writeAll(stream, new Uint8Array(buf));
	}
	async read(stream: Reader) {
		const buf = new ArrayBuffer(this.size);
		await readAll(stream, new Uint8Array(buf));
		const dv = new DataView(buf);
		return this.decode(dv);
	}
}

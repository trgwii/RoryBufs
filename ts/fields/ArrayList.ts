import type { Field, Reader, Writer } from "../field.d.ts";
import { U32 } from "./U32.ts";
import type { ValueFromField } from "../utils.ts";

export class ArrayList<F extends Field<unknown>>
	implements Field<ValueFromField<F>[]> {
	readonly size = "variadic";
	#u32 = new U32();
	constructor(
		readonly field: F,
	) {}

	encode(items: ValueFromField<F>[], buf: DataView, offset = 0) {
		const initialOffset = offset;
		buf.setUint32(offset, items.length);
		offset += 4;
		for (const value of items) {
			offset += this.field.encode(value, buf, offset);
		}
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const initialOffset = offset;
		const items: ValueFromField<F>[] = [];
		const length = buf.getUint32(offset);
		offset += 4;
		for (let i = 0; i < length; i++) {
			const { bytesRead, value } = this.field.decode(buf, offset);
			items.push(value as ValueFromField<F>);
			offset += bytesRead;
		}
		return {
			bytesRead: offset - initialOffset,
			value: items as ValueFromField<F>[],
		};
	}
	async write(items: ValueFromField<F>[], stream: Writer) {
		let bytesWritten = await this.#u32.write(items.length, stream);
		for (const value of items) {
			bytesWritten += await this.field.write(value, stream);
		}
		return bytesWritten;
	}
	async read(stream: Reader) {
		const length = await this.#u32.read(stream);
		const items: ValueFromField<F>[] = [];
		for (let i = 0; i < length; i++) {
			const value = await this.field.read(stream);
			items.push(value as ValueFromField<F>);
		}
		return items;
	}
}

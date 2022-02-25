import type { Field, Reader, Writer } from "../field.d.ts";
import { U32 } from "./U32.ts";

export class ArrayList<T> implements Field<T[]> {
	readonly size = "variadic";
	#u32 = new U32();
	constructor(
		readonly field: Field<T>,
	) {}

	encode(items: T[], buf: DataView, offset = 0) {
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
		const items: T[] = [];
		const length = buf.getUint32(offset);
		offset += 4;
		for (let i = 0; i < length; i++) {
			const { bytesRead, value } = this.field.decode(buf, offset);
			items.push(value);
			offset += bytesRead;
		}
		return { bytesRead: offset - initialOffset, value: items as T[] };
	}
	async write(items: T[], stream: Writer) {
		let bytesWritten = await this.#u32.write(items.length, stream);
		for (const value of items) {
			bytesWritten += await this.field.write(value, stream);
		}
		return bytesWritten;
	}
	async read(stream: Reader) {
		const length = await this.#u32.read(stream);
		const items: T[] = [];
		for (let i = 0; i < length; i++) {
			items.push(await this.field.read(stream));
		}
		return items;
	}
}

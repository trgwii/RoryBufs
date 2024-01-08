import type { Field, Reader, Writer } from "../field.ts";
import { U8 } from "./U8.ts";
import { assertWithin, type ValueFromFields } from "../utils.ts";

export class Union<Fields extends Field<unknown>[]>
	implements Field<ValueFromFields<Fields>> {
	readonly size = "variadic";
	#u8 = new U8();
	constructor(
		readonly fields: Fields,
		readonly tag: (val: ValueFromFields<Fields>) => number,
	) {
		this.#u8.validate(fields.length);
	}
	validate(value: ValueFromFields<Fields>) {
		const index = this.tag(value);
		assertWithin(index, 0, this.fields.length);
		this.fields[index].validate(value);
	}
	requiredSize(value: ValueFromFields<Fields>): number {
		const index = this.tag(value);
		return this.fields[index].requiredSize(value) + 1;
	}
	encode(value: ValueFromFields<Fields>, buf: DataView, offset = 0) {
		const index = this.tag(value);
		const initialOffset = offset;
		buf.setUint8(offset, index);
		offset += 1;
		offset += this.fields[index].encode(value, buf, offset);
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const index = buf.getUint8(offset);
		offset += 1;
		const { bytesRead, value } = this.fields[index].decode(buf, offset);
		return {
			bytesRead: bytesRead + 1,
			value: value as ValueFromFields<Fields>,
		};
	}
	async write(value: ValueFromFields<Fields>, stream: Writer) {
		const index = this.tag(value);
		let bytesWritten = await this.#u8.write(index, stream);
		bytesWritten += await this.fields[index].write(value, stream);
		return bytesWritten;
	}
	async read(stream: Reader) {
		const index = await this.#u8.read(stream);
		let bytesRead = index.bytesRead;
		const result = await this.fields[index.value].read(stream);
		bytesRead += result.bytesRead;
		return { bytesRead, value: result.value as ValueFromFields<Fields> };
	}
}

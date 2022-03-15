import type { Field, Reader, Writer } from "../field.d.ts";
import { U32 } from "./U32.ts";
import { mapError, type ValueFromField } from "../utils.ts";

export class ArrayList<
	F extends Field<unknown>,
	Len extends Field<number | bigint> = U32,
> implements Field<ValueFromField<F>[]> {
	readonly size = "variadic";
	constructor(
		readonly field: F,
		//@ts-expect-error No obvious solution to this, bugged if user does `new ArrayList<F, SomeLen>(f);` (passes the Len generic but not the value)
		readonly length: Len = new U32(),
	) {}
	validate(items: ValueFromField<F>[]) {
		mapError("Invalid array length", () => this.length.validate(items.length));
		for (let i = 0; i < items.length; i++) {
			const value = items[i];
			mapError(
				`Invalid array item at index ${i}`,
				() => this.field.validate(value),
			);
		}
	}
	encode(items: ValueFromField<F>[], buf: DataView, offset = 0) {
		const initialOffset = offset;
		offset += this.length.encode(items.length, buf, offset);
		for (const value of items) {
			offset += this.field.encode(value, buf, offset);
		}
		return offset - initialOffset;
	}
	decode(buf: DataView, offset = 0) {
		const initialOffset = offset;
		const items: ValueFromField<F>[] = [];
		const { bytesRead, value: length } = this.length.decode(buf, offset);
		offset += bytesRead;
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
		let bytesWritten = await this.length.write(items.length, stream);
		for (const value of items) {
			bytesWritten += await this.field.write(value, stream);
		}
		return bytesWritten;
	}
	async read(stream: Reader) {
		let bytesRead = 0;
		const length = await this.length.read(stream);
		bytesRead += length.bytesRead;
		const items: ValueFromField<F>[] = [];
		for (let i = 0; i < length.value; i++) {
			const result = await this.field.read(stream);
			bytesRead += result.bytesRead;
			items.push(result.value as ValueFromField<F>);
		}
		return { bytesRead, value: items };
	}
}

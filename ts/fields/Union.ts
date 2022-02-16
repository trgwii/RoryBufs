import type { Field } from "../field.d.ts";
import { assertWithin } from "../utils.ts";

type TypeFromFields<Fields extends Field<unknown>[]> = Fields[number] extends
	Field<infer T> ? T : never;
export class Union<Fields extends Field<unknown>[]>
	implements Field<TypeFromFields<Fields>> {
	readonly size = "variadic";
	constructor(
		readonly fields: Fields,
		readonly tag: (val: TypeFromFields<Fields>) => number,
	) {
		assertWithin(fields.length, 0, 8);
	}

	encode(value: TypeFromFields<Fields>, buf: DataView, offset = 0) {
		const index = this.tag(value);
		assertWithin(index, 0, this.fields.length);
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
		return { bytesRead: bytesRead + 1, value: value as TypeFromFields<Fields> };
	}
}

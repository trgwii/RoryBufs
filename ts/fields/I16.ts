import type { Field, Reader, Writer } from "../field.d.ts";
import { assertWithin, readAll, writeAll } from "../utils.ts";

export class I16 implements Field<number> {
	readonly size = 2;
	encode(value: number, buf: DataView, offset = 0) {
		assertWithin(value, -0x10000 / 2, 0x10000 / 2 - 1);
		buf.setInt16(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getInt16(offset) };
	}
	write(value: number, stream: Writer) {
		const buf = new ArrayBuffer(this.size);
		const dv = new DataView(buf);
		this.encode(value, dv);
		return writeAll(stream, new Uint8Array(buf));
	}
	async read(stream: Reader) {
		const buf = new ArrayBuffer(this.size);
		await readAll(stream, new Uint8Array(buf));
		const dv = new DataView(buf);
		return this.decode(dv).value;
	}
}

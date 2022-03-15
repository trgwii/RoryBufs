import type { Field, Reader, Writer } from "../field.d.ts";
import { assertWithin, readAll, writeAll } from "../utils.ts";

export class I32 implements Field<number> {
	readonly size = 4;
	constructor(readonly littleEndian = false) {}
	validate(value: number) {
		assertWithin(value, -0x100000000 / 2, 0x100000000 / 2 - 1);
	}
	encode(value: number, buf: DataView, offset = 0) {
		buf.setInt32(offset, value, this.littleEndian);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return {
			bytesRead: this.size,
			value: buf.getInt32(offset, this.littleEndian),
		};
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
		return this.decode(dv);
	}
}

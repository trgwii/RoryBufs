import type { Field, Reader, Writer } from "../field.ts";
import { assertWithin, readAll, writeAll } from "../utils.ts";

export class U32 implements Field<number> {
	readonly size = 4;
	constructor(readonly littleEndian = false) {}
	validate(value: number) {
		assertWithin(value, 0, 0xFFFFFFFF);
	}
	requiredSize(): number {
		return this.size;
	}
	encode(value: number, buf: DataView, offset = 0) {
		buf.setUint32(offset, value, this.littleEndian);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return {
			bytesRead: this.size,
			value: buf.getUint32(offset, this.littleEndian),
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

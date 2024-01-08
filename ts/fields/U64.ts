import type { Field, Reader, Writer } from "../field.ts";
import { assertWithin, readAll, writeAll } from "../utils.ts";

export class U64 implements Field<bigint> {
	readonly size = 8;
	constructor(readonly littleEndian = false) {}
	validate(value: bigint) {
		assertWithin(value, 0n, 0xFFFFFFFFFFFFFFFFn);
	}
	requiredSize(): number {
		return this.size;
	}
	encode(value: bigint, buf: DataView, offset = 0) {
		buf.setBigUint64(offset, value, this.littleEndian);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return {
			bytesRead: this.size,
			value: buf.getBigUint64(offset, this.littleEndian),
		};
	}
	write(value: bigint, stream: Writer) {
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

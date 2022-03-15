import type { Field, Reader, Writer } from "../field.d.ts";
import { assert, readAll, writeAll } from "../utils.ts";

export class F32 implements Field<number> {
	readonly size = 4;
	validate(value: number) {
		assert(!Number.isNaN(value), "NaN");
	}
	encode(value: number, buf: DataView, offset = 0) {
		buf.setFloat32(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getFloat32(offset) };
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

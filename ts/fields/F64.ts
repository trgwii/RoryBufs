import type { Field, Reader, Writer } from "../field.d.ts";
import { writeAll } from "../utils.ts";

export class F64 implements Field<number> {
	readonly size = 8;
	encode(value: number, buf: DataView, offset = 0) {
		buf.setFloat64(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getFloat64(offset) };
	}
	write(value: number, stream: Writer) {
		const buf = new ArrayBuffer(this.size);
		const dv = new DataView(buf);
		this.encode(value, dv);
		return writeAll(stream, new Uint8Array(buf));
	}
	async read(stream: Reader) {
		const buf = new ArrayBuffer(this.size);
		const bytesRead = await stream.read(new Uint8Array(buf));
		const dv = new DataView(buf);
		if (bytesRead === null) throw new Error("End of stream");
		return this.decode(dv).value;
	}
}

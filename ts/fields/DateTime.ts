import type { Field, Reader, Writer } from "../field.d.ts";
import { writeAll } from "../utils.ts";

export class DateTime implements Field<Date> {
	readonly size = 8;
	encode(value: Date, buf: DataView, offset = 0) {
		buf.setFloat64(offset, value.getTime());
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: new Date(buf.getFloat64(offset)) };
	}
	write(value: Date, stream: Writer) {
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
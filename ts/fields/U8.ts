import type { Field, Reader, Writer } from "../field.ts";
import { assertWithin } from "../utils.ts";

export class U8 implements Field<number> {
	readonly size = 1;
	validate(value: number) {
		assertWithin(value, 0, 0xFF);
	}
	encode(value: number, buf: DataView, offset = 0) {
		buf.setUint8(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getUint8(offset) };
	}
	write(value: number, stream: Writer) {
		const buf = new ArrayBuffer(this.size);
		const dv = new DataView(buf);
		this.encode(value, dv);
		return stream.write(new Uint8Array(buf));
	}
	async read(stream: Reader) {
		const buf = new ArrayBuffer(this.size);
		const bytesRead = await stream.read(new Uint8Array(buf));
		if (bytesRead === null) throw new Error("End of stream");
		const dv = new DataView(buf);
		return this.decode(dv);
	}
}

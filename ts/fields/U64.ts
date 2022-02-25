import type { Field, Reader, Writer } from "../field.d.ts";
import { assertWithin, writeAll } from "../utils.ts";

export class U64 implements Field<bigint> {
	readonly size = 8;
	encode(value: bigint, buf: DataView, offset = 0) {
		assertWithin(value, 0n, 0xFFFFFFFFFFFFFFFFn);
		buf.setBigUint64(offset, value);
		return this.size;
	}
	decode(buf: DataView, offset = 0) {
		return { bytesRead: this.size, value: buf.getBigUint64(offset) };
	}
	write(value: bigint, stream: Writer) {
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

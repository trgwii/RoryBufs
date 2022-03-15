import type { Field, Reader, Writer } from "../field.d.ts";
import { writeAll } from "../utils.ts";

export class CString implements Field<string> {
	readonly size = "variadic";
	validate() {}
	encode(value: string, buf: DataView, offset = 0) {
		const _buf = new Uint8Array(
			buf.buffer,
			buf.byteOffset + offset,
			buf.byteLength - offset,
		);
		const result = new TextEncoder().encodeInto(value, _buf);
		_buf[result.written] = 0;
		return result.written + 1;
	}
	decode(buf: DataView, offset = 0) {
		const _buf = new Uint8Array(
			buf.buffer,
			buf.byteOffset + offset,
			buf.byteLength - offset,
		);
		const idx = _buf.indexOf(0);
		if (idx === -1) throw new Error("Invalid C String - missing \\0");
		return {
			bytesRead: idx + 1,
			value: new TextDecoder().decode(_buf.subarray(0, idx)),
		};
	}
	async write(value: string, stream: Writer) {
		const encoded = new TextEncoder().encode(value);
		await writeAll(stream, encoded);
		await stream.write(new Uint8Array([0]));
		return encoded.byteLength + 1;
	}
	async read(stream: Reader) {
		const buf: number[] = [];
		const p = new Uint8Array([0]);
		while (true) {
			const result = await stream.read(p);
			if (result === null) throw new Error("Invalid C string - EOF");
			if (p[0] === 0) {
				return {
					bytesRead: buf.length + 1,
					value: new TextDecoder().decode(new Uint8Array(buf)),
				};
			}
			buf.push(p[0]);
		}
	}
}

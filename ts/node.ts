export { ArrayList } from "./fields/ArrayList.ts";
export { CString } from "./fields/CString.ts";
export { DateTime } from "./fields/DateTime.ts";
export { F32 } from "./fields/F32.ts";
export { F64 } from "./fields/F64.ts";
export { FixedArray } from "./fields/FixedArray.ts";
export { FixedText } from "./fields/FixedText.ts";
export { I16 } from "./fields/I16.ts";
export { I32 } from "./fields/I32.ts";
export { I64 } from "./fields/I64.ts";
export { I8 } from "./fields/I8.ts";
export { Null } from "./fields/Null.ts";
export { Optional } from "./fields/Optional.ts";
export { Struct } from "./fields/Struct.ts";
export { Text } from "./fields/Text.ts";
export { U16 } from "./fields/U16.ts";
export { U32 } from "./fields/U32.ts";
export { U64 } from "./fields/U64.ts";
export { U8 } from "./fields/U8.ts";
export { Union } from "./fields/Union.ts";

export { Buf } from "./mod.ts";

import type { Reader, Writer } from "./field.ts";
export type { Reader, Writer };

declare class Readable {
	readableLength: number;
	once(e: "readable", cb: () => void): this;
	read(size?: number): Uint8Array | null;
}

export const fromReadable = (r: Readable): Reader => ({
	async read(p) {
		await new Promise<void>((resolve) => r.once("readable", resolve));
		const bytes = Math.min(p.byteLength, r.readableLength);
		const buf = r.read(bytes);
		if (!buf) return null;
		p.set(buf);
		return bytes;
	},
});

declare class Writable {
	once(e: "drain", cb: () => void): this;
	write(buf: Uint8Array): boolean;
	end(): this;
}

export const fromWritable = (w: Writable): Writer => ({
	async write(p) {
		if (!w.write(p)) {
			await new Promise<void>((resolve) => w.once("drain", resolve));
		}
		return p.byteLength;
	},
});

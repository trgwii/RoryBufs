import type { Writer } from "./field.d.ts";

export function assert(
	ok: boolean,
	message: string,
	Err: ErrorConstructor = Error,
) {
	if (!ok) throw new Err(message);
}

export function assertWithin<T extends number | bigint>(
	value: T,
	min: T,
	max: T,
) {
	assert(
		value >= min && value < max,
		String(value) + " is out of bounds",
		RangeError,
	);
}

export async function writeAll(stream: Writer, buf: Uint8Array) {
	let bytesWritten = 0;
	while (bytesWritten < buf.length) {
		bytesWritten += await stream.write(buf.subarray(bytesWritten));
	}
	return bytesWritten;
}

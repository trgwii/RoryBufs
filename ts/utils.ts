import type { Field, Reader, Writer } from "./field.d.ts";

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

export async function readAll(stream: Reader, buf: Uint8Array) {
	let bytesRead = 0;
	while (bytesRead < buf.byteLength) {
		const result = await stream.read(buf.subarray(bytesRead));
		if (result === null) throw new Error("End of stream");
		bytesRead += result;
	}
	return bytesRead;
}

export async function writeAll(stream: Writer, buf: Uint8Array) {
	let bytesWritten = 0;
	while (bytesWritten < buf.byteLength) {
		bytesWritten += await stream.write(buf.subarray(bytesWritten));
	}
	return bytesWritten;
}

export type ValueFromField<F extends Field<unknown>> = F extends Field<infer T>
	? T
	: never;

export type ValueFromSchema<Schema extends Record<string, Field<unknown>>> = {
	[K in keyof Schema]: Schema[K] extends Field<infer V> ? V : never;
};

export type ValueFromFields<Fields extends Field<unknown>[]> =
	Fields[number] extends Field<infer T> ? T : never;

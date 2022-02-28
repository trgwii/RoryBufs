export interface Writer {
	write(p: Uint8Array): Promise<number>;
}

export interface Reader {
	read(p: Uint8Array): Promise<number | null>;
}

export interface Field<T> {
	size: number | "variadic";
	encode(value: T, buf: DataView, offset?: number): number;
	decode(buf: DataView, offset?: number): { bytesRead: number; value: T };
	write(value: T, stream: Writer): Promise<number>;
	read(stream: Reader): Promise<{ bytesRead: number; value: T }>;
}
